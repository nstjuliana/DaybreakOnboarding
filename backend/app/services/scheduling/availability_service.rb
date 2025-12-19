# frozen_string_literal: true

##
# Scheduling::AvailabilityService
#
# Generates available appointment time slots for a clinician
# based on their schedule configuration and existing appointments.
#
# @see Clinician model
# @see Appointment model
# @see _docs/phases/phase-3-insurance-matching.md
#
# @example Getting available slots
#   service = Scheduling::AvailabilityService.new(clinician, Date.today, Date.today + 14)
#   slots = service.available_slots
#   # => [{ date: '2024-01-15', time: '09:00', end_time: '10:00', available: true }, ...]
#
module Scheduling
  class AvailabilityService
    # Default appointment duration in minutes
    DEFAULT_DURATION = 50

    # Slot interval in minutes (appointments start on the hour)
    SLOT_INTERVAL = 60

    # Business hours (default if clinician has no schedule)
    DEFAULT_START_HOUR = 9
    DEFAULT_END_HOUR = 17

    ##
    # Initializes the availability service
    #
    # @param clinician [Clinician] The clinician to check availability for
    # @param start_date [Date] Start of date range
    # @param end_date [Date] End of date range
    # @param duration [Integer] Appointment duration in minutes
    #
    def initialize(clinician, start_date, end_date, duration: DEFAULT_DURATION)
      @clinician = clinician
      @start_date = start_date
      @end_date = end_date
      @duration = duration
    end

    ##
    # Returns all available time slots in the date range
    #
    # @return [Array<Hash>] Array of slot objects with date, time, and availability
    #
    def available_slots
      slots = []

      (@start_date..@end_date).each do |date|
        # Skip past dates
        next if date < Date.current

        # Get slots for this day
        day_slots = slots_for_date(date)
        slots.concat(day_slots)
      end

      slots
    end

    ##
    # Returns slots grouped by date
    #
    # @return [Hash<String, Array<Hash>>] Slots grouped by date string
    #
    def slots_by_date
      available_slots.group_by { |slot| slot[:date] }
    end

    ##
    # Checks if a specific slot is available
    #
    # @param date [Date] The date
    # @param time [String] The time (HH:MM format)
    # @return [Boolean] Whether the slot is available
    #
    def slot_available?(date, time)
      slot_start = parse_datetime(date, time)
      slot_end = slot_start + @duration.minutes

      # Check if within clinician's schedule
      return false unless within_schedule?(date, time)

      # Check for conflicts with existing appointments
      !has_conflict?(slot_start, slot_end)
    end

    private

    ##
    # Generates slots for a specific date
    #
    # @param date [Date] The date
    # @return [Array<Hash>] Slots for the date
    #
    def slots_for_date(date)
      day_schedule = schedule_for_day(date)
      return [] if day_schedule.empty?

      slots = []
      existing_appointments = appointments_on_date(date)

      day_schedule.each do |period|
        period_slots = generate_period_slots(date, period, existing_appointments)
        slots.concat(period_slots)
      end

      slots
    end

    ##
    # Gets schedule periods for a day
    #
    # @param date [Date] The date
    # @return [Array<Hash>] Schedule periods
    #
    def schedule_for_day(date)
      availability = @clinician.availability || {}
      day_name = date.strftime('%A').downcase

      # Get schedule for this day of week
      day_schedule = availability[day_name] || availability[day_name.to_sym]

      # Use default schedule if none configured
      if day_schedule.blank?
        # Skip weekends by default
        return [] if date.saturday? || date.sunday?

        return [{ 'start' => format_time(DEFAULT_START_HOUR), 'end' => format_time(DEFAULT_END_HOUR) }]
      end

      day_schedule.is_a?(Array) ? day_schedule : [day_schedule]
    end

    ##
    # Generates slots for a schedule period
    #
    # @param date [Date] The date
    # @param period [Hash] The schedule period
    # @param existing [Array<Appointment>] Existing appointments
    # @return [Array<Hash>] Slots for the period
    #
    def generate_period_slots(date, period, existing)
      slots = []

      start_time = parse_time(period['start'] || period[:start])
      end_time = parse_time(period['end'] || period[:end])

      return slots if start_time.nil? || end_time.nil?

      current_time = start_time
      while current_time + @duration.minutes <= end_time
        slot_start = date.to_datetime.change(hour: current_time.hour, min: current_time.min)

        # Skip if slot is in the past
        if slot_start > Time.current
          slot_end = slot_start + @duration.minutes
          is_available = !slot_conflicts?(slot_start, slot_end, existing)

          slots << {
            date: date.iso8601,
            time: format_time_string(current_time),
            end_time: format_time_string(current_time + @duration.minutes),
            datetime: slot_start.iso8601,
            duration: @duration,
            available: is_available
          }
        end

        current_time += SLOT_INTERVAL.minutes
      end

      slots
    end

    ##
    # Checks if slot conflicts with existing appointments
    #
    # @param slot_start [DateTime] Slot start time
    # @param slot_end [DateTime] Slot end time
    # @param existing [Array<Appointment>] Existing appointments
    # @return [Boolean] Whether there's a conflict
    #
    def slot_conflicts?(slot_start, slot_end, existing)
      existing.any? do |appt|
        appt_end = appt.scheduled_at + appt.duration_minutes.minutes
        # Check for overlap
        slot_start < appt_end && slot_end > appt.scheduled_at
      end
    end

    ##
    # Gets appointments on a specific date
    #
    # @param date [Date] The date
    # @return [Array<Appointment>] Appointments on the date
    #
    def appointments_on_date(date)
      @clinician.appointments
        .kept
        .where(status: ['scheduled', 'confirmed'])
        .where(scheduled_at: date.all_day)
        .to_a
    end

    ##
    # Checks if time is within schedule
    #
    # @param date [Date] The date
    # @param time [String] The time
    # @return [Boolean]
    #
    def within_schedule?(date, time)
      day_schedule = schedule_for_day(date)
      return false if day_schedule.empty?

      slot_time = parse_time(time)
      return false if slot_time.nil?

      day_schedule.any? do |period|
        period_start = parse_time(period['start'] || period[:start])
        period_end = parse_time(period['end'] || period[:end])
        next false if period_start.nil? || period_end.nil?

        slot_time >= period_start && slot_time + @duration.minutes <= period_end
      end
    end

    ##
    # Checks for appointment conflicts
    #
    # @param slot_start [DateTime] Slot start
    # @param slot_end [DateTime] Slot end
    # @return [Boolean]
    #
    def has_conflict?(slot_start, slot_end)
      @clinician.appointments
        .kept
        .where(status: ['scheduled', 'confirmed'])
        .exists?(['scheduled_at < ? AND scheduled_at + (duration_minutes || \' minutes\')::interval > ?', slot_end,
                  slot_start])
    end

    ##
    # Parses datetime from date and time string
    #
    # @param date [Date] The date
    # @param time [String] Time string (HH:MM)
    # @return [DateTime]
    #
    def parse_datetime(date, time)
      time_parts = time.split(':')
      date.to_datetime.change(hour: time_parts[0].to_i, min: time_parts[1].to_i)
    end

    ##
    # Parses time string to Time object
    #
    # @param time_str [String] Time string (HH:MM)
    # @return [Time, nil]
    #
    def parse_time(time_str)
      return nil if time_str.blank?

      Time.zone.parse(time_str)
    rescue ArgumentError
      nil
    end

    ##
    # Formats hour to time string
    #
    # @param hour [Integer] Hour (0-23)
    # @return [String] Formatted time (HH:00)
    #
    def format_time(hour)
      format('%02d:00', hour)
    end

    ##
    # Formats time object to string
    #
    # @param time [Time] The time
    # @return [String] Formatted time (HH:MM)
    #
    def format_time_string(time)
      time.strftime('%H:%M')
    end
  end
end
