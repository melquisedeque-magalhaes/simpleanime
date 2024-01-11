import { FlatList, Image, Pressable, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { Link } from 'expo-router'
import { api } from '../services/api'

type Anime = {
  id: number
  title: {
    english: string
  }
  coverImage: string
}

export default function App() {
  async function getAnimesRecent() {
    try {
      const { data } = await api.post<Anime[]>('/recent', {
        type: 'anime',
        page: '1',
        perPage: '20',
        fields: ['title', 'coverImage', 'id'],
      })

      return data
    } catch (err) {
      console.log('err', err)
    }
  }

  async function getAnimesMostWatch() {
    try {
      const { data } = await api.post('/seasonal', {
        type: 'anime',
        fields: ['title', 'coverImage', 'id'],
      })

      return data.top as Anime[]
    } catch (err) {
      console.log('err', err)
    }
  }

  const listAnimeRecentsFetch = useQuery({
    queryKey: ['list-anime-recents'],
    queryFn: getAnimesRecent,
  })

  const listAnimeMostWatchFetch = useQuery({
    queryKey: ['list-anime-most-watch'],
    queryFn: getAnimesMostWatch,
  })

  if (listAnimeRecentsFetch.error) {
    return (
      <Text className="text-red-500 text-base">
        {listAnimeRecentsFetch.error.message}
      </Text>
    )
  }

  return (
    <View className="flex-1 bg-background p-4 gap-2">
      <View className="items-center">
        <Text className="text-white font-bold text-2xl">SimpleAnime</Text>
      </View>

      <View className="mt-6">
        <Text className=" font-semibold text-white text-base font-heading">
          Novidades no SimpleAnime
        </Text>

        <FlatList
          className="my-2 max-h-52"
          keyExtractor={(item) => String(item.id)}
          data={listAnimeRecentsFetch.data}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Link asChild href={`/details/${item.id}`}>
              <Pressable>
                <Image
                  style={{ resizeMode: 'contain' }}
                  className="w-28 h-48 rounded overflow-hidden"
                  alt="anime-novidades"
                  source={{
                    uri: item.coverImage,
                  }}
                />
              </Pressable>
            </Link>
          )}
        />
      </View>

      <View className="mt-6">
        <Text className=" font-semibold text-white text-base font-heading">
          Mais assistidos no SimpleAnime
        </Text>

        <FlatList
          className="my-2 max-h-52 mt-4"
          keyExtractor={(item) => String(item.id)}
          data={listAnimeMostWatchFetch.data}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <Link asChild href={`/details/${item.id}`}>
              <Pressable>
                <Image
                  style={{ resizeMode: 'contain' }}
                  className="w-28 h-48 rounded overflow-hidden"
                  alt="anime-novidades"
                  source={{
                    uri: item.coverImage,
                  }}
                />
              </Pressable>
            </Link>
          )}
        />
      </View>
    </View>
  )
}
