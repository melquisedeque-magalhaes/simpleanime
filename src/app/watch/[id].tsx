import {
  AVPlaybackStatusError,
  AVPlaybackStatusSuccess,
  ResizeMode,
  Video,
} from 'expo-av'
import { useGlobalSearchParams, useRouter } from 'expo-router'
import { useRef } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { api } from '../../services/api'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react-native'
import { useQuery } from '@tanstack/react-query'

type Media = {
  url: string
  quality: string
}

interface Sources {
  sources: Media[]
}

type Episode = {
  id: string
  number: number
}

export default function WatchAnime() {
  const { animeId, epNumber, id } = useGlobalSearchParams<{
    animeId: string
    epNumber: string
    id: string
  }>()
  const videoRef = useRef<Video | null>(null)

  const { back, push } = useRouter()

  async function getEps() {
    try {
      const { data } = await api.post(`/episodes/${animeId}`)

      return data as { episodes: Episode[]; providerId: string }[]
    } catch (err) {
      console.log('err', err)
    }
  }

  const getEpsFetch = useQuery({
    queryKey: ['eps-anime'],
    queryFn: getEps,
  })

  async function getEpVideo() {
    try {
      const { data } = await api.post<Sources>('/sources', {
        providerId: 'gogoanime',
        watchId: `/${id}`,
        episodeNumber: Number(epNumber),
        id: animeId,
        subType: 'sub',
        server: 'gogocdn',
      })

      return data.sources
    } catch (err) {
      console.log('err', err)
    }
  }

  const watchAnimeFetch = useQuery({
    queryKey: ['watch-anime'],
    queryFn: getEpVideo,
  })

  // sets the current time, if video is finished, moves to the next video
  const handlePlaybackStatusUpdate = (
    status: AVPlaybackStatusError | AVPlaybackStatusSuccess,
  ) => {
    if ('positionMillis' in status) {
      if (status.didJustFinish) {
        playNextVideo()
      }
    }
  }

  function handleNavigateToVideo(item: Episode) {
    if (item.id.startsWith('/watch')) {
      return `${item.id}&epNumber=${item.number}&animeId=${id}`
    }

    return `/watch${item.id}?epNumber=${item.number}&animeId=${id}`
  }

  const filterProviderGogoanime = getEpsFetch?.data?.find(
    (provider) => provider.providerId === 'gogoanime',
  )

  function playNextVideo() {
    if (filterProviderGogoanime) {
      handleNavigateToVideo(filterProviderGogoanime.episodes[Number(epNumber)])
    }
  }

  function playPrevVideo() {
    if (filterProviderGogoanime) {
      handleNavigateToVideo(
        filterProviderGogoanime.episodes[
          Number(epNumber) > 0 ? -1 : Number(epNumber)
        ],
      )
    }
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row justify-between mt-6 ml-4">
        <TouchableOpacity onPress={back}>
          <ChevronLeft size={24} color="#ccc" />
        </TouchableOpacity>

        <Text className="text-white text-xl font-bold max-w-80">
          Episodio {epNumber}
        </Text>
      </View>

      {watchAnimeFetch?.data && (
        <>
          <Video
            ref={videoRef}
            source={{
              uri: watchAnimeFetch?.data[0]?.url,
            }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            style={{
              width: 'auto',
              height: 300,
            }}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          <View className="flex-row justify-between px-4">
            <TouchableOpacity
              onPress={playPrevVideo}
              className="bg-gray-800 rounded-lg p-4 flex-row items-center w-44"
            >
              <ChevronLeft className="w-4 h-4" color="#fff" />
              <Text className="text-white">Episodio anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playNextVideo}
              className="bg-gray-800 rounded-lg p-4 flex-row items-center w-44"
            >
              <Text className="text-white">Proximo episodio</Text>
              <ChevronRight className="w-4 h-4" color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <View className="px-4 mt-4">
        <Text className="font-semibold text-white text-xl">Episodes</Text>

        <FlatList
          className="mt-4 max-h-96"
          data={filterProviderGogoanime?.episodes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 34 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={
                item.number === Number(epNumber) && {
                  backgroundColor: '#7159c1',
                }
              }
              onPress={() => push(handleNavigateToVideo(item))}
              className="bg-slate-700 h-14 p-4 rounded-lg flex-row justify-between items-center"
            >
              <Text className="text-white text-base font-medium">
                Episode {item.number}
              </Text>
              <Play className="w-4 h-4" color="#fff" />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  )
}
