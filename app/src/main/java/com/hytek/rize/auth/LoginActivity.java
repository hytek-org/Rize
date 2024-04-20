package com.hytek.rize.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.textfield.TextInputLayout;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException;
import com.google.firebase.auth.FirebaseUser;
import com.hytek.rize.HomeActivity;
import com.hytek.rize.R;

import java.util.Objects;

public class LoginActivity extends AppCompatActivity {

    private FirebaseAuth mAuth;



    private TextInputLayout emailTextInputLayout;
    private TextInputLayout passwordTextInputLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);

        mAuth = FirebaseAuth.getInstance();

        emailTextInputLayout = findViewById(R.id.email_field);
        passwordTextInputLayout = findViewById(R.id.password_field);

        Button loginButton = findViewById(R.id.login_button);
        loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loginUser();
            }
        });

        Button registerButton = findViewById(R.id.register_link);
        registerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
                startActivity(intent);
                finish();
            }
        });
    }


    private void loginUser() {
        String email = Objects.requireNonNull(emailTextInputLayout.getEditText()).getText().toString().trim();
        String password = Objects.requireNonNull(passwordTextInputLayout.getEditText()).getText().toString().trim();

        // Input validation
        if (TextUtils.isEmpty(email) || TextUtils.isEmpty(password)) {
            Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(this, "Invalid email format", Toast.LENGTH_SHORT).show();
            return;
        }

        // Attempt to sign in the user
       
        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        // Sign in success, update UI with the signed-in user's information
                        FirebaseUser user = mAuth.getCurrentUser();


                        checkEmailVerification();
                    }else {
                        Exception e = task.getException();
                        if (e instanceof FirebaseAuthInvalidCredentialsException) {
                            // Handle invalid email/password error
                            Toast.makeText(LoginActivity.this, "Invalid email or password.", Toast.LENGTH_SHORT).show();
                        } else if (e.getMessage().contains("blocked")) {
                            // Handle blocked application error
                            Toast.makeText(LoginActivity.this, "Rize app is currently blocked. Please contact the developer.", Toast.LENGTH_SHORT).show();
                        } else {
                            // Handle other errors
                            Toast.makeText(LoginActivity.this, "Login failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }
                });
    }
    // Check if user's email is verified
    private void checkEmailVerification() {
        FirebaseUser user = mAuth.getCurrentUser();
        if (user != null) {
            user.reload().addOnCompleteListener(task -> {
                if (user.isEmailVerified()) {
                    // Email is verified, proceed to login activity
                    Toast.makeText(LoginActivity.this, "Login successful!", Toast.LENGTH_SHORT).show();
                    //  Navigate to next activity or handle successful registration
                    // Start the new activity here
                    Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
                    startActivity(intent);
                    // Finish the current activity
                    finish();

                } else {
                    // Email is not verified, inform the user
                    Toast.makeText(LoginActivity.this, "Please verify your email before logging in.", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }

}
