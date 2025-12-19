# frozen_string_literal: true

##
# CreateUsers Migration
#
# Creates the users table with Devise authentication fields,
# user type for onboarding flow routing, and profile data.
#
# Uses UUID primary keys for HIPAA compliance (prevents ID enumeration).
#
# @see User model
# @see _docs/user-flow.md for user type definitions
#
class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, id: :uuid do |t|
      ## Database authenticatable
      t.string :email, null: false, default: ''
      t.string :encrypted_password, null: false, default: ''

      ## Recoverable
      t.string :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      t.integer :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string :current_sign_in_ip
      t.string :last_sign_in_ip

      ## Confirmable
      t.string :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string :unconfirmed_email

      ## Lockable
      t.integer :failed_attempts, default: 0, null: false
      t.string :unlock_token
      t.datetime :locked_at

      ## Custom fields for Parent Onboarding AI
      t.string :user_type, null: false, default: 'parent'
      t.string :phone
      t.string :first_name
      t.string :last_name
      t.date :date_of_birth
      t.jsonb :profile, default: {}

      ## Soft delete support
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token, unique: true
    add_index :users, :unlock_token, unique: true
    add_index :users, :user_type
    add_index :users, :discarded_at
  end
end

