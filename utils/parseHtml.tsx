import { Text } from "react-native";

export default function parseHTMLContent(html: string)  {
    const parts = html
      .replace(/<!\[CDATA\[|\]\]>/g, '') // Remove CDATA
      .split(/(<\/?[^>]+>)/g); // Split by HTML tags

    return parts.map((part, index) => {
      if (part.startsWith("<p>")) {
        return <Text key={index} style={{ marginBottom: 8 }}>{part.replace(/<[^>]+>/g, '')}</Text>;
      } else if (part.startsWith("</p>")) {
        return <Text key={index}>{'\n'}</Text>;
      } else if (part.startsWith("<br")) {
        return <Text key={index}>{'\n'}</Text>;
      } else if (part.startsWith("&amp;")) {
        return <Text key={index}>{part.replace(/&amp;/g, '&')}</Text>;
      } else {
        return <Text key={index}>{part}</Text>; // Plain text or unknown tags
      }
    });
  };