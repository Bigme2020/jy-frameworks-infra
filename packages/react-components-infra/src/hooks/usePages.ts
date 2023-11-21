import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEffectWithoutFirstTime } from './useEffectWithoutFirstTime'

const normalizeExtraParams = (
  extraParams: Record<string, any>,
  omitWhenEmpty = true
) => {
  if (!extraParams) return ''
  return Object.keys(extraParams).reduce((prevString, curKey) => {
    const isEmpty =
      extraParams[curKey] === undefined || extraParams[curKey] === null
    if (isEmpty && omitWhenEmpty) {
      return prevString
    } else {
      return (prevString += `${curKey}=${
        typeof extraParams[curKey] === 'string'
          ? extraParams[curKey]
          : JSON.stringify(extraParams[curKey])
      }&`)
    }
  }, '')
}

interface CustomNameOfKey {
  // request
  from?: string
  // response
  pageFrom?: string
  hasMore?: string
  dataList?: string
}

const getCustomNameOfKey = (customNameOfKey?: CustomNameOfKey) =>
  Object.assign(
    {
      from: 'from',
      pageFrom: 'pageFrom',
      hasMore: 'hasMore',
      dataList: 'dataList',
    },
    customNameOfKey || {}
  )

interface Params {
  from?: number
  start?: number
  limit?: number
  size?: number
  [key: string]: any
}

export interface OnVisibilityChangeMethods {
  reload: (start?: number) => void
  loadMore: () => void
}

export interface UsePagesConfig {
  initialFrom?: number // 初始起点
  reloadFrom?: number // reload时的起点
  extraParams?: any // 除了 start/from,limit 以外的参数
  loadingLock?: boolean // 上次的loading未结束时是否锁住
  customNameOfKey?: CustomNameOfKey // 字段改名
  queryOnMount?: boolean // 是否已开始就请求
  // 外部控制
  outerDataList?: any
  setData?: any
  outerHasMore?: any
  setOuterHasMore?: any
}

/**
 * 泛型 T 指定后端返回的result或object_list的数据类型
 *
 * 内部不会去监听extraParams的改变，需要外部自己监听，并通过reload也好，手动清除也好的方式刷新列表
 *
 * @param {string} url 请求地址
 * @param {number} limit 每页请求数量
 * @param {any} config.extraParams 可选, 请求参数（内部不会因为外部extraParams改变而重新请求，外部需要自行判断何时请求）
 * @param {boolean} config.loadingLock 可选, 默认true
 * @param {number} config.initialStart 可选 首次请求的start 默认0
 * @param {number} config.reloadStart 可选 reload时的start 默认0
 * @param {ManualSetParams<any>} config.manualSetParams 可选, 手动设置除第一次请求外的params，会自动带上extraParams，所以也可以在这里面覆写extraParams，
 * 使用场景详见：/shop/myAvatar/hooks/useAvatarList 的请求列表所需参数
 */

export function usePagesWithCursor<T>(
  url: string,
  fetcher: (url: string, fetchConfig: RequestInit) => Promise<any>,
  config?: UsePagesConfig
) {
  const DEFAULT_CONFIG: UsePagesConfig = {
    extraParams: {},
    loadingLock: true,
    queryOnMount: false,
  }

  const {
    extraParams,
    loadingLock,
    initialFrom = 0,
    reloadFrom = 0,
    customNameOfKey,
    outerDataList,
    setData,
    outerHasMore,
    setOuterHasMore,
    queryOnMount,
  } = Object.assign(DEFAULT_CONFIG, config)

  const initialTime = useRef(0)

  const normalizeCustomNameOfKey = useMemo(
    () => getCustomNameOfKey(customNameOfKey),
    [customNameOfKey]
  )

  const [dataList, _setDataList] = useState<T[]>([])
  const setDataList = useCallback(
    (dataOrCallback: T[] | ((data: T[]) => T[])) => {
      if (typeof setData === 'function') {
        setData(dataOrCallback)
      } else {
        _setDataList(dataOrCallback)
      }
    },
    [setData, _setDataList]
  )
  const [params, setParams] = useState<Params>({
    [normalizeCustomNameOfKey.from]: initialFrom,
    ...extraParams,
  })

  const lastestUrl = useRef(url)
  const lastestDTO = useRef<any>()

  const [_hasMore, _setHasMore] = useState(true)
  const hasMore = useRef(true)
  const setHasMore = useCallback((val: boolean) => {
    _setHasMore(val)
    hasMore.current = val
  }, [])

  useEffectWithoutFirstTime(() => {
    if (typeof setOuterHasMore === 'function') {
      setOuterHasMore(_hasMore)
    }
  }, [_hasMore, setOuterHasMore])

  const [_isLoading, _setIsLoading] = useState(false)
  const isLoading = useRef(false)
  const setIsLoading = (val: boolean) => {
    isLoading.current = val
    _setIsLoading(val)
  }

  const reload = useCallback(
    (from: number = reloadFrom) => {
      setDataList([])
      setParams({
        [normalizeCustomNameOfKey.from]: from,
        ...extraParams,
      })
      setHasMore(false)
      setIsLoading(false)
    },
    [extraParams, normalizeCustomNameOfKey, reloadFrom, setDataList, setHasMore]
  )

  useEffect(() => {
    if (lastestUrl.current === url) return
    reload()
    lastestUrl.current = url
  }, [url])

  useEffect(() => {
    if (
      !queryOnMount &&
      (process.env.NODE_ENV === 'development'
        ? initialTime.current < 2
        : initialTime.current < 1)
    ) {
      initialTime.current++
      return
    }

    if (
      queryOnMount &&
      (process.env.NODE_ENV === 'development'
        ? initialTime.current < 1
        : initialTime.current < 0)
    ) {
      initialTime.current++
      return
    }

    setIsLoading(true)
    const fetchUrl = `${url}?${normalizeExtraParams(params)}`
    fetcher(fetchUrl, {
      method: 'get',
    })
      .then((res: any) => {
        lastestDTO.current = res
        setIsLoading(false)
        setDataList((dataList: any[]) => [
          ...(dataList || []),
          ...((res[normalizeCustomNameOfKey.dataList] || []) as T[]),
        ])
        setHasMore(!!res[normalizeCustomNameOfKey.hasMore])
      })
      .catch((error: any) => {
        setIsLoading(false)
        console.error(error)
      })
  }, [params])

  const loadMore = useCallback(() => {
    const normalLoadMore = () => {
      setParams({
        ...params,
        [normalizeCustomNameOfKey.from]:
          (lastestDTO.current &&
            lastestDTO.current[normalizeCustomNameOfKey.pageFrom]) ||
          0,
      })
    }
    // 优先用外部的hasMore
    if (outerHasMore !== undefined) {
      if (outerHasMore) {
        if (loadingLock && isLoading.current) return
        normalLoadMore()
      }
    } else if (hasMore.current) {
      if (loadingLock && isLoading.current) return
      normalLoadMore()
    }
  }, [
    params,
    outerHasMore,
    hasMore.current,
    normalizeCustomNameOfKey,
    lastestDTO.current,
    loadingLock,
  ])

  return {
    data: (outerDataList || dataList) as T[],
    hasMore: useMemo<boolean>(() => {
      if (outerHasMore === undefined) return _hasMore
      return outerHasMore
    }, [outerHasMore, _hasMore]),
    isLoading: _isLoading,
    setDataList,
    loadMore,
    reload,
  }
}
