package com.hytek.rize.tasks;

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

import com.hytek.rize.notes.NotesActivity;
import com.hytek.rize.user.profile.ProfileActivity;
import com.hytek.rize.utils.TaskDatabaseHelper;

import java.util.ArrayList;
public class TasksActivity extends AppCompatActivity {

    private BottomNavigationView bottomNavigationView;
    private EditText editTextTask;
    private Button buttonSaveTask;
    private ListView listViewTasks;
    private ArrayList<String> tasksList;
    private ArrayAdapter<String> adapter;
    private TaskDatabaseHelper dbHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tasks);


        bottomNavigationView = findViewById(R.id.nav_view);
        bottomNavigationView.setOnNavigationItemSelectedListener( new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                int itemId = item.getItemId();
                if (itemId == R.id.item_1) {
                    // Navigate to a different activity (e.g., HomeActivity)
                    Intent intent = new Intent(TasksActivity.this, HomeActivity.class);
                    startActivity(intent);

                    return true;
                } else if (itemId == R.id.item_2) {
                    // Navigate to another activity (e.g., TasksActivity)
                    Intent intent = new Intent(TasksActivity.this, TasksActivity.class);
                    startActivity(intent);
                    finish();
                    return true;
                } else if (itemId == R.id.item_4) {
                    // Navigate to another activity (e.g., NotesActivity)
                    Intent intent = new Intent(TasksActivity.this, NotesActivity.class);
                    startActivity(intent);

                    return true;
                }
                else if (itemId == R.id.item_5) {
                    // Navigate to another activity (e.g., ProfileActivity)
                    Intent intent = new Intent(TasksActivity.this, ProfileActivity.class);
                    startActivity(intent);
                    return true;
                }
                // No change needed for other items
                return false;
            }
        });






        editTextTask = findViewById(R.id.editTextTask);
        buttonSaveTask = findViewById(R.id.buttonSaveTask);
        listViewTasks = findViewById(R.id.listViewTasks);

        tasksList = new ArrayList<>();
        adapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1, tasksList);
        listViewTasks.setAdapter(adapter);

        dbHelper = new TaskDatabaseHelper(this);
        displayTasks();

        buttonSaveTask.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveTask();
            }
        });

        listViewTasks.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                // Handle item click if needed
            }
        });
    }

    private void saveTask() {
        String taskText = editTextTask.getText().toString().trim();
        if (!taskText.isEmpty()) {
            SQLiteDatabase db = dbHelper.getWritableDatabase();
            ContentValues values = new ContentValues();
            values.put("task", taskText);
            long newRowId = db.insert("tasks", null, values);
            if (newRowId != -1) {
                tasksList.add(taskText);
                adapter.notifyDataSetChanged();
                editTextTask.setText("");
            } else {
                Toast.makeText(this, "Failed to save task", Toast.LENGTH_SHORT).show();
            }
            db.close();
        } else {
            Toast.makeText(this, "Please enter a task", Toast.LENGTH_SHORT).show();
        }
    }

    private void displayTasks() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        String[] projection = {"task"};
        Cursor cursor = db.query("tasks", projection, null, null, null, null, null);
        while (cursor.moveToNext()) {
            String taskText = cursor.getString(cursor.getColumnIndexOrThrow("task"));
            tasksList.add(taskText);
        }
        adapter.notifyDataSetChanged();
        cursor.close();
        db.close();
    }
}