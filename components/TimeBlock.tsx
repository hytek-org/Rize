import React from 'react';
import { View } from 'react-native';

interface TimeSlotTask {
  task: {
    id: number;
    content: string;
    time: string;
    subtasks?: {
      id: string;
      content: string;
      completed: boolean;
    }[];
  };
  label: 'Previous' | 'Current' | 'Next';
  timeLabel: string;
  borderColor: string; // Add this property to the interface
}

interface TimeBlockProps {
  item: TimeSlotTask;
  currentHourString: string;
}

const getCurrentMinuteBlock = (): number => {
  const currentMinute = new Date().getMinutes();
  if (currentMinute < 15) return 3; // 0-14 minutes
  if (currentMinute < 30) return 2; // 15-29 minutes
  if (currentMinute < 45) return 1; // 30-44 minutes
  return 0; // 45-59 minutes
};

const TimeBlock: React.FC<TimeBlockProps> = ({ item, currentHourString }) => {
  const minuteBlock = getCurrentMinuteBlock();
  const colors = ["bg-green-500", "bg-green-400", "bg-green-300", "bg-green-200"];

  return (
    <View className={` ${item.task.time === currentHourString ? "flex flex-row gap-2 rounded-full pt-10 " : "hidden"}`}>
      {colors.map((color, index) => (
        <View key={index} className={`p-0.5 ${index >= minuteBlock ? color : 'bg-green-500'} w-1/4 rounded-full`}>
        </View>
      ))}
    </View>
  );
};

export default TimeBlock;
