package com.hytek.rize;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class AuthCheckFragment extends Fragment {

    private FirebaseAuth mAuth;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mAuth = FirebaseAuth.getInstance();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_auth_check, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        checkAuthenticationStatus();
    }

    private void checkAuthenticationStatus() {
        FirebaseUser currentUser = mAuth.getCurrentUser();
        if (currentUser != null) {
            // User is authenticated
            navigateToHome();
        } else {
            // User is not authenticated
            navigateToGuest();
        }
    }

    private void navigateToHome() {
        if (getActivity() != null && getActivity().findViewById(R.id.fragment_container) != null) {
            FragmentManager fragmentManager = getActivity().getSupportFragmentManager();
            if (fragmentManager.findFragmentById(R.id.fragment_container) instanceof HomeFragment) {
                // Already in HomeFragment, no need to navigate again
                return;
            }
            fragmentManager.beginTransaction()
                    .replace(R.id.fragment_container, new HomeFragment())
                    .addToBackStack(null)
                    .commit();
        }
    }

    private void navigateToGuest() {
        if (getActivity() != null && getActivity().findViewById(R.id.fragment_container) != null) {
            FragmentManager fragmentManager = getActivity().getSupportFragmentManager();
            if (fragmentManager.findFragmentById(R.id.fragment_container) instanceof GuestFragment) {
                // Already in GuestFragment, no need to navigate again
                return;
            }
            fragmentManager.beginTransaction()
                    .replace(R.id.fragment_container, new GuestFragment())
                    .addToBackStack(null)
                    .commit();
        }
    }
}
