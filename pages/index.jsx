import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import { NFTCard } from '../components/nftCard';
const config = require('./config.json')

const MAINNET_URL = config['mainnet_url']
const KEY = MAINNET_URL.substring('https://eth-mainnet.g.alchemy.com/v2/'.length, MAINNET_URL.length)
console.log(`key = ${KEY}`)

const Home = () => {
  const [wallet, setWalletAddress] = useState("");
  const [collection, setCollectionAddress] = useState("");
  const [NFTs, setNFTs] = useState([])
  const [fetchForCollection, setFetchForCollection]=useState(false)

  const [isLoading, setLoading] = useState(false);
  const [startToken, setStartToken] = useState('');

  const fetchNFTs = async() => {
    let nfts; 
    //reset start token incase it was set in fetchNFTsForCollection()
    setStartToken('')
    console.log("fetching nfts");
    // insert alchemy api key
    const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${KEY}/getNFTs/`;
    console.log(baseURL)
    var requestOptions = {
        method: 'GET'
      };
     
    if (!collection.length) {
      setLoading(true)
      const fetchURL = `${baseURL}?owner=${wallet}`;
  
      nfts = await fetch(fetchURL, requestOptions).then(data => data.json())
    } else {
      setLoading(true)
      console.log("fetching nfts for collection owned by address")
      const fetchURL = `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}`;
      nfts= await fetch(fetchURL, requestOptions).then(data => data.json())
    }
  
    if (nfts) {
      console.log("nfts:", nfts)
      setNFTs(nfts.ownedNfts)
    }
    setLoading(false)
  }

  const fetchNFTsForCollection = async () => {
    if (collection.length) {
      setLoading(true)
      var requestOptions = {
        method: 'GET'
      };
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${KEY}/getNFTsForCollection/`;
      let fetchURL = null;
      if (startToken.length) {
        fetchURL = `${baseURL}?contractAddress=${collection}&startToken=${startToken}&withMetadata=${"true"}`;

      }else {
        fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}`;
      }

      console.log(fetchURL)

      const nfts = await fetch(fetchURL, requestOptions).then(data => data.json())
      if (nfts) {
        console.log("NFTs in collection:", nfts)
        setNFTs(nfts.nfts)

        if (nfts?.nextToken?.length) {
          setStartToken(nfts.nextToken)
        } else {
          setStartToken('')
        }
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
      <input disabled={fetchForCollection} onChange={(e)=>{setWalletAddress(e.target.value)}} value={wallet} type={"text"} placeholder="Add your wallet address"></input>
        <input onChange={(e)=>{setCollectionAddress(e.target.value)}} value={collection} type={"text"} placeholder="Add the collection address"></input>
        <label className="text-gray-600 "><input onChange={(e)=>{setFetchForCollection(e.target.checked)}} type={"checkbox"} className="mr-2"></input>Fetch for collection</label>
        <button disabled={isLoading} className={"disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"} onClick={
          () => {
            if (fetchForCollection) {
              fetchNFTsForCollection();
            }else fetchNFTs();
          }
        }>Let's go! </button>
      </div>

      <div className='flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center'>
        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin size="2x"/> : 
          NFTs.length && NFTs.map((nft, i) => {
            return (
              <NFTCard nft={nft} key={i}></NFTCard>
            )
          })
        }
      </div>

      {/* Pagination */}
        {!isLoading && startToken.length ? 
        <>
        <div className='text-white bg-green-600 px-2 py-2 mt-3 rounded-sm'
        onClick={() => fetchNFTsForCollection()}>
          View next 100 NFTs
        </div>
        </>
        : ''}

    </div>
  )
}

export default Home