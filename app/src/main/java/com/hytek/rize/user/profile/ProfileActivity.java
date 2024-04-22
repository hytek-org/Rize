package com.hytek.rize.user.profile;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.hytek.rize.HomeActivity;
import com.hytek.rize.R;
import com.hytek.rize.notes.NotesActivity;
import com.hytek.rize.tasks.TasksActivity;

public class ProfileActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;
    private TextView textViewUserEmail;
    private Button buttonLogout;
    private SharedPreferences prefs;
    private FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        bottomNavigationView = findViewById(R.id.nav_view);
        bottomNavigationView.setOnNavigationItemSelectedListener( new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                int itemId = item.getItemId();
                if (itemId == R.id.item_1) {
                    // Navigate to a different activity (e.g., HomeActivity)
                    Intent intent = new Intent(ProfileActivity.this, HomeActivity.class);
                    startActivity(intent);

                    return true;
                } else if (itemId == R.id.item_2) {
                    // Navigate to another activity (e.g., TasksActivity)
                    Intent intent = new Intent(ProfileActivity.this, TasksActivity.class);
                    startActivity(intent);

                    return true;
                } else if (itemId == R.id.item_4) {
                    // Navigate to another activity (e.g., NotesActivity)
                    Intent intent = new Intent(ProfileActivity.this, NotesActivity.class);
                    startActivity(intent);

                    return true;
                }
                else if (itemId == R.id.item_5) {
                    // Navigate to another activity (e.g., ProfileActivity)
                    Intent intent = new Intent(ProfileActivity.this, ProfileActivity.class);
                    startActivity(intent);
                    finish();
                    return true;
                }
                // No change needed for other items
                return false;
            }
        });





        // Initialize Firebase Auth
        mAuth = FirebaseAuth.getInstance();

        // Get the application context
        Context context = getApplicationContext();

        // Initialize SharedPreferences
        prefs = context.getSharedPreferences(
                context.getPackageName() + "_preferences",
                Context.MODE_PRIVATE);

        textViewUserEmail = findViewById(R.id.textViewUserEmail);
        buttonLogout = findViewById(R.id.buttonLogout);

        // Check if user is authenticated based on SharedPreferences
        boolean isAuthenticated = prefs.getBoolean("isAuthenticated", false); // Default to false if not set

        if (isAuthenticated) {
            // User is authenticated, proceed with normal operations
            FirebaseUser user = mAuth.getCurrentUser();
            if (user != null) {
                // Set the user's email on the TextView
                textViewUserEmail.setText(user.getEmail());
            } else {
                // If user data is missing in Firebase but authenticated flag is set, handle the discrepancy
                Toast.makeText(this, "Unexpected error. Please log in again.", Toast.LENGTH_SHORT).show();
                prefs.edit().clear().apply(); // Clear authentication state
                finish();
            }
        } else {
            // User is not authenticated, navigate back to the login activity
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show();
            finish();
        }

        // Set up the logout button click listener
        buttonLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Sign out the user
                mAuth.signOut();

                // Update the authentication state in SharedPreferences
                prefs.edit().putBoolean("isAuthenticated", false).apply();

                // Redirect the user to the login activity
                Toast.makeText(ProfileActivity.this, "Logged out successfully", Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }
}
