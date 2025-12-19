# frozen_string_literal: true

##
# JwtDenylist Model
#
# Stores invalidated JWT tokens for the devise-jwt revocation strategy.
# When a user logs out, their token's JTI (JWT ID) is added to this table
# to prevent reuse of the token.
#
# @see https://github.com/waiting-for-dev/devise-jwt#revocation-strategies
#
class JwtDenylist < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Denylist

  self.table_name = 'jwt_denylist'
end
