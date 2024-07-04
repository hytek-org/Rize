import AsyncStorage from "@react-native-async-storage/async-storage";

// Import JSON files statically
import artistData from "../assets/data/artist.json";
import entrepreneursData from "../assets/data/entrepreneurs.json";
import medicalData from "../assets/data/medical.json";
import studentData from "../assets/data/student.json";
import softwareDevData from "../assets/data/software-dev.json";
import teachersData from "../assets/data/teachers.json";

// Create TemplateItem and Template interfaces
interface TemplateItem {
  id: number;
  content: string;
  time: string;
}

interface Template {
  id: number;
  title: string;
  desc: string;
  public: boolean;
  items: TemplateItem[];
}

const STORAGE_KEY = "Templates";

export const initializeTemplates = async (): Promise<Template[]> => {
  try {
    // Retrieve existing templates from AsyncStorage
    const storedTemplates = await AsyncStorage.getItem(STORAGE_KEY);
    let existingTemplates: Template[] = storedTemplates ? JSON.parse(storedTemplates) : [];

    // List of JSON files with their descriptions
    const files = [
      { name: 'Artist', desc: 'Template for artists', data: artistData },
      { name: 'Entrepreneurs', desc: 'Template for entrepreneurs', data: entrepreneursData },
      { name: 'Medical', desc: 'Template for medical professionals', data: medicalData },
      { name: 'Student', desc: 'Template for students', data: studentData },
      { name: 'Software-dev', desc: 'Template for software developers', data: softwareDevData },
      { name: 'Teachers', desc: 'Template for teachers', data: teachersData },
    ];

    // Process JSON data into Template format and add new templates
    const newTemplates: Template[] = files.map((file, index) => ({
      id: index + 1, // Generate ID based on index + 1 (to start from 1)
      title: file.name, // Use file name as title
      desc: file.desc, // Use provided description
      public: true, // Set public to true
      items: file.data as TemplateItem[], // Assign JSON data to items
    }));

    // Filter out templates that already exist
    const templatesToAdd = newTemplates.filter(newTemplate => 
      !existingTemplates.some(existingTemplate => existingTemplate.title === newTemplate.title)
    );

    // Combine existing templates with new templates to add
    const allTemplates = [...existingTemplates, ...templatesToAdd];

    // Save the combined templates to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTemplates));

    return allTemplates;
  } catch (error) {
    throw error; // Throw error for the component to handle
  }
};
