# frozen_string_literal: true

##
# SSERenderer
#
# Helper class for rendering Server-Sent Events (SSE) responses.
# Provides consistent formatting for SSE streams.
#
# @example
#   sse = SSERenderer.new(response.stream)
#   sse.write("Hello", event: "message")
#   sse.write({ data: "test" }, event: "data")
#   sse.close
#
class SSERenderer
  attr_reader :stream

  ##
  # Initializes the SSE renderer
  #
  # @param stream [ActionController::Live::Buffer] The response stream
  #
  def initialize(stream)
    @stream = stream
  end

  ##
  # Writes data to the SSE stream
  #
  # @param data [String, Hash] Data to send (hashes are JSON-encoded)
  # @param event [String] Optional event name
  # @param id [String] Optional event ID
  # @param retry_ms [Integer] Optional retry interval in milliseconds
  #
  def write(data, event: nil, id: nil, retry_ms: nil)
    output = []
    output << "id: #{id}" if id
    output << "event: #{event}" if event
    output << "retry: #{retry_ms}" if retry_ms

    # Handle data
    formatted_data = data.is_a?(Hash) ? data.to_json : data.to_s
    formatted_data.split("\n").each do |line|
      output << "data: #{line}"
    end

    output << "\n" # End of message

    stream.write(output.join("\n"))
  rescue IOError, ActionController::Live::ClientDisconnected => e
    Rails.logger.debug { "[SSE] Client disconnected: #{e.message}" }
    close
  end

  ##
  # Writes a chunk of content (for streaming text)
  #
  # @param content [String] Content chunk
  #
  def write_chunk(content)
    write({ chunk: content, type: 'chunk' }, event: 'chunk')
  end

  ##
  # Writes a complete message
  #
  # @param content [String] Full message content
  # @param metadata [Hash] Additional metadata
  #
  def write_message(content, metadata = {})
    write({
            content: content,
            type: 'message',
            **metadata
          }, event: 'message')
  end

  ##
  # Writes an error event
  #
  # @param error [String] Error message
  # @param code [String] Optional error code
  #
  def write_error(error, code: nil)
    write({
            error: error,
            code: code,
            type: 'error'
          }, event: 'error')
  end

  ##
  # Writes a completion event
  #
  # @param metadata [Hash] Completion metadata
  #
  def write_complete(metadata = {})
    write({
            type: 'complete',
            **metadata
          }, event: 'complete')
  end

  ##
  # Writes a heartbeat to keep connection alive
  #
  def heartbeat
    write('', event: 'heartbeat')
  end

  ##
  # Closes the stream
  #
  def close
    stream.close
  rescue StandardError => e
    Rails.logger.debug { "[SSE] Error closing stream: #{e.message}" }
  end
end
