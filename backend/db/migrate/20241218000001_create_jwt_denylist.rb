# frozen_string_literal: true

##
# CreateJwtDenylist Migration
#
# Creates the JWT denylist table for token revocation.
# Used by devise-jwt to track invalidated tokens.
#
# @see https://github.com/waiting-for-dev/devise-jwt
#
class CreateJwtDenylist < ActiveRecord::Migration[8.0]
  def change
    create_table :jwt_denylist do |t|
      t.string :jti, null: false
      t.datetime :exp, null: false

      t.timestamps
    end

    add_index :jwt_denylist, :jti, unique: true
  end
end

