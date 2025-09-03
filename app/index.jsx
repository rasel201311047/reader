
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';


export default function Index() {
  return (

    <View style={{display:'flex', gap:'4px'}}>
            <TouchableOpacity onPress={()=>router.push('/audio1')}>
        <Text>Audio1</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>router.push('/audio2')}>
        <Text>Audio2</Text>
      </TouchableOpacity>

    </View>
  );
}


