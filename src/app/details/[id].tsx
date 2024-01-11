import {
  ImageBackground,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { ChevronLeft, Play } from 'lucide-react-native'
import { useGlobalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'

import { api } from '../../services/api'

type Episode = {
  id: string
  number: number
}

type Data = {
  episodes: Episode[]
  providerId: string
}

type Anime = {
  id: number
  title: {
    english: string
  }
  slug: string
  coverImage: string
  bannerImage: string
  description: string
  episodes: {
    data: Data[]
  }
}

export default function DetailsAnime() {
  const { id } = useGlobalSearchParams<{ id: string }>()

  console.log('id', id)

  async function getInfoAnimes() {
    try {
      const { data } = await api.get<Anime>(`/info/${id}`)

      return data
    } catch (err) {
      console.log('err', err)
    }
  }

  const { data } = useQuery({
    queryKey: ['details-info-anime'],
    queryFn: getInfoAnimes,
  })

  const { back, push } = useRouter()

  function handleNavigateToVideo(item: Episode) {
    console.log('item', item)

    if (item.id.startsWith('/watch')) {
      return `${item.id}&epNumber=${item.number}&animeId=${id}`
    }

    return `/watch${item.id}?epNumber=${item.number}&animeId=${id}`
  }

  const filterProviderGogoanime = data?.episodes?.data.find(
    (provider) => provider.providerId === 'gogoanime',
  )

  return (
    <View className="flex-1 bg-background">
      <ImageBackground
        source={{
          uri: data?.bannerImage || data?.coverImage,
        }}
        className="w-full h-56 rounded-2xl overflow-hidden"
      >
        <View className="p-4 bg-background/55 h-full">
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={back}>
              <ChevronLeft size={24} color="#ccc" />
            </TouchableOpacity>

            <Text className="text-white text-xl font-bold max-w-80">
              {data?.title.english}
            </Text>
          </View>
          <View className="items-center mt-auto">
            <TouchableOpacity
              className="bg-slate-900/95 gap-2 flex-row rounded-full h-14 py-3 w-52 px-4 items-center justify-center"
              onPress={back}
            >
              <Play className="w-4 h-4" color="#fff" />
              <Text className="text-white text-base font-bold">Assistir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <View className="mt-6 px-4 gap-4">
        <View>
          <Text className="font-semibold text-white text-xl">Description</Text>
          <Text className="text-base text-slate-50 text-justify mt-2">
            {data?.description}
          </Text>
        </View>

        <View>
          <Text className="font-semibold text-white text-xl">Episodes</Text>

          <FlatList
            className="mt-4 max-h-96"
            data={filterProviderGogoanime?.episodes}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 34 }}
            renderItem={({ item }) => (
              //   <Link asChild href={}>
              <TouchableOpacity
                onPress={() => push(handleNavigateToVideo(item))}
                className="bg-slate-700 h-14 p-4 rounded-lg flex-row justify-between items-center"
              >
                <Text className="text-white text-base font-medium">
                  Episode {item.number}
                </Text>
                <Play className="w-4 h-4" color="#fff" />
              </TouchableOpacity>
              //   </Link>
            )}
          />
        </View>
      </View>
    </View>
  )
}
