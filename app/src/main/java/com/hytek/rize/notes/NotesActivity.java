package com.hytek.rize.notes;

import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.hytek.rize.HomeActivity;
import com.hytek.rize.R;
import com.hytek.rize.tasks.TasksActivity;
import com.hytek.rize.user.profile.ProfileActivity;
import com.hytek.rize.utils.NotesDatabaseHelper;

import java.util.ArrayList;
public class NotesActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;
    private EditText editTextNote;
    private Button buttonSaveNote;
    private ListView listViewNotes;
    private ArrayList<String> notesList;
    private ArrayAdapter<String> adapter;
    private NotesDatabaseHelper dbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notes);


        bottomNavigationView = findViewById(R.id.nav_view);
        bottomNavigationView.setOnNavigationItemSelectedListener( new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                int itemId = item.getItemId();
                if (itemId == R.id.item_1) {
                    // Navigate to a different activity (e.g., HomeActivity)
                    Intent intent = new Intent(NotesActivity.this, HomeActivity.class);
                    startActivity(intent);

                    return true;
                } else if (itemId == R.id.item_2) {
                    // Navigate to another activity (e.g., TasksActivity)
                    Intent intent = new Intent(NotesActivity.this, TasksActivity.class);
                    startActivity(intent);

                    return true;
                } else if (itemId == R.id.item_4) {
                    // Navigate to another activity (e.g., NotesActivity)
                    Intent intent = new Intent(NotesActivity.this, NotesActivity.class);
                    startActivity(intent);
                    finish();
                    return true;
                }
                else if (itemId == R.id.item_5) {
                    // Navigate to another activity (e.g., ProfileActivity)
                    Intent intent = new Intent(NotesActivity.this, ProfileActivity.class);
                    startActivity(intent);

                    return true;
                }
                // No change needed for other items
                return false;
            }
        });






        editTextNote = findViewById(R.id.editTextNote);
        buttonSaveNote = findViewById(R.id.buttonSaveNote);
        listViewNotes = findViewById(R.id.listViewNotes);

        notesList = new ArrayList<>();
        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, notesList);
        listViewNotes.setAdapter(adapter);

        dbHelper = new NotesDatabaseHelper(this);
        displayNotes();

        buttonSaveNote.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveNote();
            }
        });

        listViewNotes.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                // Handle item click if needed
            }
        });
    }

    private void saveNote() {
        String noteText = editTextNote.getText().toString().trim();
        if (!noteText.isEmpty()) {
            SQLiteDatabase db = dbHelper.getWritableDatabase();
            ContentValues values = new ContentValues();
            values.put("note", noteText);
            long newRowId = db.insert("notes", null, values);
            if (newRowId != -1) {
                notesList.add(noteText);
                adapter.notifyDataSetChanged();
                editTextNote.setText("");
            } else {
                Toast.makeText(this, "Failed to save note", Toast.LENGTH_SHORT).show();
            }
            db.close();
        } else {
            Toast.makeText(this, "Please enter a note", Toast.LENGTH_SHORT).show();
        }
    }

    private void displayNotes() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        String[] projection = {"note"};
        String sortOrder = "id DESC"; // Sort by id column in descending order
        Cursor cursor = db.query("notes", projection, null, null, null, null, sortOrder);
        while (cursor.moveToNext()) {
            String noteText = cursor.getString(cursor.getColumnIndexOrThrow("note"));
            notesList.add(noteText);
        }
        adapter.notifyDataSetChanged();
        cursor.close();
        db.close();
    }


}