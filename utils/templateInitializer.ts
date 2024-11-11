import AsyncStorage from "@react-native-async-storage/async-storage";


// Import JSON files
import artistData from "../assets/data/artist.json";
import entrepreneursData from "../assets/data/entrepreneurs.json";
import medicalData from "../assets/data/medical.json";
import studentData from "../assets/data/student.json";
import softwareDevData from "../assets/data/software-dev.json";
import teachersData from "../assets/data/teachers.json";

// TemplateItem and Template interfaces
interface TemplateItem {
  id: number; // ID as a number
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

// JSON file list with descriptions
const files = [
  { name: "Artist", desc: "Template for artists", data: artistData },
  { name: "Entrepreneurs", desc: "Template for entrepreneurs", data: entrepreneursData },
  { name: "Medical", desc: "Template for medical professionals", data: medicalData },
  { name: "Student", desc: "Template for students", data: studentData },
  { name: "Software-dev", desc: "Template for software developers", data: softwareDevData },
  { name: "Teachers", desc: "Template for teachers", data: teachersData },
];
const generateNumericId = (): number => {
  return Math.floor(Math.random() * 1000000000) + Date.now(); // A random number, with Date.now for added uniqueness
};

// Utility function to convert JSON data into Template format
const mapToTemplate = (file: typeof files[number]): Template => ({
  id: generateNumericId(), // Generate a unique number ID
  title: file.name,
  desc: file.desc,
  public: true,
  items: file.data.map(item => ({
    ...item,
    id: Number(item.id), // Ensure the `id` remains a number
  })) as TemplateItem[],
});

export const initializeTemplates = async (): Promise<Template[]> => {
  try {
    // Fetch existing templates from AsyncStorage
    const storedTemplates = await AsyncStorage.getItem(STORAGE_KEY);
    const existingTemplates: Template[] = storedTemplates ? JSON.parse(storedTemplates) : [];

    // Create new templates from JSON files
    const newTemplates = files.map(mapToTemplate);

    // Filter out any templates that are already present in AsyncStorage
    const templatesToAdd = newTemplates.filter(
      newTemplate => !existingTemplates.some(existingTemplate => existingTemplate.title === newTemplate.title)
    );

    if (templatesToAdd.length > 0) {
      // Update AsyncStorage with the new templates added to existing ones
      const allTemplates = [...existingTemplates, ...templatesToAdd];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTemplates));
      return allTemplates;
    } else {
      // If no new templates were added, return existing templates
      return existingTemplates;
    }
  } catch (error) {
    console.error("Failed to initialize templates:", error);
    throw new Error("Template initialization failed");
  }
};
