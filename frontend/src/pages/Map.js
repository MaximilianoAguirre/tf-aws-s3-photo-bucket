import React, { useState, useRef } from "react"
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import Leaflet from 'leaflet'

import { useLocatedPhotoslList } from "api/dynamo"
import { geohash } from "util/geohash"
import { ImageDrawer } from "components/ImageDrawer"
import { zoom_to_char } from "config/map"


// At a particular map view, a set of big hashes is calculated to query all 
// photos in those regions. All responses are processed and joined in a big
// array of photos. A set of small hashes is also calculated, and all the 
// photos queried are grouped by small hash. This way, we make the less amount
// of queries and get a good precision when locating photos in the map (queries
// are reduced but browser processing is added).
export const Map = () => {
    const [hashesBig, setHashesBig] = useState([])
    const [hashesSmall, setHashesSmall] = useState([])
    const resultsTotal = useLocatedPhotoslList(hashesBig)
    const drawer = useRef()

    // console.group("hash info")
    // console.log(`Number of hashes to query: ${hashesBig.length}`)
    // console.log(`Number of hashes to process: ${hashesSmall.length}`)
    // console.groupEnd()

    const allPhotos = resultsTotal.reduce((acc, curr) => acc.concat(curr.data || []), [])
    const markersAux = allPhotos.reduce((acc, curr) => {
        const hash = hashesSmall.find(hash => curr.geohash.S.startsWith(hash))

        if (hash) {
            const prev = acc[hash] || 0
            acc[hash] = prev + 1
        }

        return acc
    }, {})
    const markers = Object.keys(markersAux).map(hash => {
        const { latitude, longitude } = geohash.decode(hash)

        return {
            hash: hash,
            count: markersAux[hash],
            position: [latitude, longitude]
        }
    })

    return <>
        <MapContainer
            center={[-41.1627, -71.4826]}
            zoom={6}
            minZoom={4}
            scrollWheelZoom={true}
            style={{ height: "300px", minHeight: "calc(100vh - 134px)" }}
            whenReady={(e) => {
                const map = e.target

                const update_hashes = () => {
                    const bounds = map.getBounds()
                    const zoom = map.getZoom()

                    setHashesBig(geohash.bboxes(
                        bounds._southWest.lat,
                        bounds._southWest.lng,
                        bounds._northEast.lat,
                        bounds._northEast.lng,
                        zoom_to_char["big"][zoom]
                    ))
                    setHashesSmall(geohash.bboxes(
                        bounds._southWest.lat,
                        bounds._southWest.lng,
                        bounds._northEast.lat,
                        bounds._northEast.lng,
                        zoom_to_char["small"][zoom]
                    ))
                }

                update_hashes()
                map.on("moveend", update_hashes);
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                markers.map(marker => {
                    // Using free icons API provided by google
                    // https://developers.google.com/chart/image/docs/gallery/dynamic_icons
                    const icon = new Leaflet.Icon({
                        iconUrl: `https://chart.googleapis.com/chart?chst=d_map_pin_letter_withshadow&chld=${marker.count}|ff0000|000000`,
                    })

                    return <Marker
                        key={marker.hash}
                        position={marker.position}
                        icon={icon}
                        eventHandlers={{
                            click: () => {
                                drawer.current.setHash(marker.hash)
                                drawer.current.open()
                            },
                        }}
                    />
                })
            }
        </MapContainer>
        <ImageDrawer ref={drawer} />
    </>
}