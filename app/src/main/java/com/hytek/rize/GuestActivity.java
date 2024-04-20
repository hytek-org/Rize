package com.hytek.rize;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;


import com.hytek.rize.auth.LoginActivity;
import com.hytek.rize.auth.RegisterActivity;

public class GuestActivity extends AppCompatActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_guest);

        Button log_in = findViewById(R.id.log_in);
        Button register_button = findViewById(R.id.register_button);
        log_in.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Start the new activity here
                Intent intent = new Intent(GuestActivity.this, LoginActivity.class);
                startActivity(intent);
            }
        });
        register_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Start the new activity here
                Intent intent = new Intent(GuestActivity.this, RegisterActivity.class);
                startActivity(intent);
            }
        });

        Button google_register_button = findViewById(R.id.google_button);
        google_register_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Retrieve the web client ID from the environment variable
                String webClientId ="Something went wrong try another way to login";

                // Check if the web client ID is not null
                if (webClientId != null) {
                    // Convert the web client ID to lowercase and display it in a Toast
                    Toast.makeText(GuestActivity.this, webClientId.toLowerCase(), Toast.LENGTH_LONG).show();
                } else {
                    // If the web client ID is null, display an error message
                    Toast.makeText(GuestActivity.this, "WEB_CLIENT_ID is not defined", Toast.LENGTH_LONG).show();
                }

            }
        });



    }

}






