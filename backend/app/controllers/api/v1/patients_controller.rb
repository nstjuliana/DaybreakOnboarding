# frozen_string_literal: true

##
# Api::V1::PatientsController
#
# Handles patient (child/adolescent) demographics collection.
# Supports different field requirements based on user type.
#
# @see Patient model
# @see _docs/phases/phase-3-insurance-matching.md
#
module Api
  module V1
    class PatientsController < BaseController
      before_action :authenticate_user!
      before_action :set_patient, only: [:show, :update]

      ##
      # GET /api/v1/patients
      #
      # Returns the current user's patient(s)
      #
      def index
        @patients = current_user.patient ? [current_user.patient] : []
        render_success(@patients.map { |p| serialize_patient(p) })
      end

      ##
      # GET /api/v1/patients/:id
      #
      # Returns a specific patient
      #
      def show
        authorize @patient
        render_success(serialize_patient(@patient))
      end

      ##
      # POST /api/v1/patients
      #
      # Creates a new patient record
      #
      def create
        @patient = current_user.build_patient(patient_params)

        if @patient.save
          render_success(serialize_patient(@patient), status: :created)
        else
          render_error(
            'Failed to save patient information',
            errors: @patient.errors.full_messages
          )
        end
      end

      ##
      # PATCH /api/v1/patients/:id
      #
      # Updates patient demographics
      #
      def update
        authorize @patient

        if @patient.update(patient_params)
          render_success(serialize_patient(@patient))
        else
          render_error(
            'Failed to update patient information',
            errors: @patient.errors.full_messages
          )
        end
      end

      private

      ##
      # Sets the patient from params
      #
      def set_patient
        @patient = Patient.find(params[:id])
      end

      ##
      # Permitted parameters for patient
      #
      def patient_params
        params.expect(
          patient: [:first_name,
                    :last_name,
                    :date_of_birth,
                    :gender,
                    :pronouns,
                    :preferred_name,
                    :email,
                    :phone,
                    :school,
                    :grade,
                    :address_line1,
                    :address_line2,
                    :city,
                    :state,
                    :zip_code,
                    :emergency_contact_name,
                    :emergency_contact_relationship,
                    :emergency_contact_phone]
        )
      end

      ##
      # Serializes patient to JSON
      #
      # @param patient [Patient] The patient to serialize
      # @return [Hash] Serialized patient data
      #
      def serialize_patient(patient)
        {
          id: patient.id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          full_name: patient.full_name,
          display_name: patient.display_name,
          date_of_birth: patient.date_of_birth,
          age: patient.age,
          gender: patient.gender,
          gender_label: patient.gender_label,
          pronouns: patient.pronouns,
          preferred_name: patient.preferred_name,
          email: patient.email,
          phone: patient.phone,
          school: patient.school,
          grade: patient.grade,
          address_line1: patient.address_line1,
          address_line2: patient.address_line2,
          city: patient.city,
          state: patient.state,
          zip_code: patient.zip_code,
          emergency_contact_name: patient.emergency_contact_name,
          emergency_contact_relationship: patient.emergency_contact_relationship,
          emergency_contact_phone: patient.emergency_contact_phone,
          has_emergency_contact: patient.has_emergency_contact?,
          created_at: patient.created_at,
          updated_at: patient.updated_at
        }
      end
    end
  end
end
