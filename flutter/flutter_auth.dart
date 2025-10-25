import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'env.dart';

class AuthService {
  late BetterAuthClient _client;

  AuthService() {
    _client = BetterAuthClient(
      baseURL: Env.betterAuthUrl,
      fetchOptions: FetchOptions(
        onRequest: (options) {
          // Add any custom headers if needed
          return options;
        },
        onResponse: (response) {
          // Handle response
          return response;
        },
      ),
    );
  }

  // Sign Up
  Future<SignUpResponse> signUp({
    required String email,
    required String password,
    String? name,
    String? username,
  }) async {
    try {
      final response = await _client.signUp.email({
        email: email,
        password: password,
        name: name,
        username: username,
      });

      return response;
    } catch (e) {
      throw Exception('Sign up failed: $e');
    }
  }

  // Sign In
  Future<SignInResponse> signIn({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _client.signIn.email({
        username: username,
        password: password,
      });

      return response;
    } catch (e) {
      throw Exception('Sign in failed: $e');
    }
  }

  // Send OTP
  Future<void> sendOTP(String email) async {
    try {
      await _client.sendVerificationOTP({
        email: email,
      });
    } catch (e) {
      throw Exception('Send OTP failed: $e');
    }
  }

  // Verify OTP
  Future<void> verifyOTP({
    required String email,
    required String otp,
  }) async {
    try {
      await _client.verifyOTP({
        email: email,
        otp: otp,
      });
    } catch (e) {
      throw Exception('Verify OTP failed: $e');
    }
  }

  // Get Session
  Future<Session?> getSession() async {
    try {
      final session = await _client.getSession();
      return session;
    } catch (e) {
      return null;
    }
  }

  // Sign Out
  Future<void> signOut() async {
    try {
      await _client.signOut();
    } catch (e) {
      throw Exception('Sign out failed: $e');
    }
  }
}