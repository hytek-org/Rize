package com.hytek.rize;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.FrameLayout;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.hytek.rize.notes.NotesActivity;
import com.hytek.rize.tasks.TasksActivity;
import com.hytek.rize.user.profile.ProfileActivity;

import java.lang.annotation.Native;

public class HomeActivity extends AppCompatActivity {

    private SharedPreferences prefs;
    private FirebaseAuth mAuth;
    private BottomNavigationView bottomNavigationView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_home);
        bottomNavigationView = findViewById(R.id.nav_view);
        bottomNavigationView.setOnNavigationItemSelectedListener( new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                int itemId = item.getItemId();
                if (itemId == R.id.item_1) {
                    // Navigate to a different activity (e.g., TasksActivity)
                    Intent intent = new Intent(HomeActivity.this, HomeActivity.class);
                    startActivity(intent);
                    finish();
                    return true;
                } else if (itemId == R.id.item_2) {
                    // Navigate to another activity (e.g., NotesActivity)
                    Intent intent = new Intent(HomeActivity.this, TasksActivity.class);
                    startActivity(intent);
                    return true;
                } else if (itemId == R.id.item_4) {
                    // Navigate to another activity (e.g., ProfileActivity)
                    Intent intent = new Intent(HomeActivity.this, NotesActivity.class);
                    startActivity(intent);
                    return true;
                }
                else if (itemId == R.id.item_5) {
                    // Navigate to another activity (e.g., ProfileActivity)
                    Intent intent = new Intent(HomeActivity.this, ProfileActivity.class);
                    startActivity(intent);
                    return true;
                }
                // No change needed for other items
                return false;
            }
        });



        // Initialize SharedPreferences
        prefs = getSharedPreferences(getPackageName() + "_preferences", Context.MODE_PRIVATE);




        // Check if user is authenticated based on SharedPreferences
        boolean isAuthenticated = prefs.getBoolean("isAuthenticated", false); // Default to false

        // Initialize Firebase Auth
        mAuth = FirebaseAuth.getInstance();
        TextView userEmailText = findViewById(R.id.user_email_text);
        if (isAuthenticated) {
            // User is authenticated (based on SharedPreferences)

            // **Use Firebase Auth to retrieve email securely (if needed)**
            FirebaseUser currentUser = mAuth.getCurrentUser();
            if (currentUser != null) {
                String userEmail = currentUser.getEmail();
                userEmailText.setText("User Email: " + userEmail);
                // You can use the email address securely within your app logic here
                // (e.g., for personalization, analytics)
            }
        } else {
            // User is not authenticated, handle the scenario (e.g., redirect to login)
        }



    }
}


