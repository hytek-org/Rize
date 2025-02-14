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
  if (currentMinute < 15) return 3; // 0-14 minutes: fill 1 block (index 3)
  if (currentMinute < 30) return 2; // 15-29 minutes: fill 2 blocks (indices 2 & 3)
  if (currentMinute < 45) return 1; // 30-44 minutes: fill 3 blocks (indices 1,2,3)
  return 0; // 45-59 minutes: fill all 4 blocks (indices 0-3)
};

const TimeBlock: React.FC<TimeBlockProps> = ({ item, currentHourString }) => {
  const minuteBlock = getCurrentMinuteBlock();

  // Choose the color palette based on the task's label.
  const blockColors =
    item.label === 'Previous'
      ? ['bg-yellow-500', 'bg-yellow-400', 'bg-yellow-300', 'bg-yellow-200']
      : item.label === 'Next'
      ? ['bg-red-500', 'bg-red-400', 'bg-red-300', 'bg-red-200']
      : ['bg-green-500', 'bg-green-400', 'bg-green-300', 'bg-green-200'];

  // Fallback color when the block is not "filled"
  const fallbackColor =
    item.label === 'Previous'
      ? 'bg-yellow-500'
      : item.label === 'Next'
      ? 'bg-red-500'
      : 'bg-green-500';

  return (
    <View
      className={`${
        item.task.time === currentHourString ? 'flex flex-row gap-2 rounded-full' : 'flex flex-row gap-2 rounded-full'
      }`}
    >
      {blockColors.map((color, index) => (
        <View
          key={index}
          className={`p-0.5 ${index >= minuteBlock ? color : fallbackColor} w-1/4 rounded-full`}
        />
      ))}
    </View>
  );
};

export default TimeBlock;
