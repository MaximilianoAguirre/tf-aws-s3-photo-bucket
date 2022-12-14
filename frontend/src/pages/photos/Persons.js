import React from 'react'
import { Button, Empty, List } from 'antd'
import { useNavigate } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useAllPersonsInfinite } from 'api/dynamo'
import { StickyHeader, WrappedSpinner, CustomSpinner, PersonAvatar } from 'components'

export const AllPersons = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useAllPersonsInfinite()
  const navigate = useNavigate()

  // Process all pages returned by DynamoDB and create a single list of photos
  const persons = data?.pages.reduce((acc, curr) => {
    return acc.concat(curr.Items)
  }, [])

  return (
    <>
      <StickyHeader chooseSize={false} title='People' />
      {isLoading ? (
        <WrappedSpinner />
      ) : !persons.length ? (
        <Empty style={{ marginTop: '15px' }} description='No persons detected' />
      ) : (
        <InfiniteScroll
          style={{ width: '100%', padding: '5px' }}
          height='calc(100vh - 56px)'
          dataLength={persons.length}
          hasChildren={persons.length}
          hasMore={hasNextPage}
          next={() => fetchNextPage()}
          loader={<CustomSpinner />}
        >
          <List
            itemLayout='horizontal'
            style={{ margin: '15px' }}
            dataSource={persons}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key='seeButton' type='primary' onClick={() => navigate(`/person/${encodeURIComponent(item.PK.S)}`)}>
                    See all
                  </Button>
                ]}
              >
                <List.Item.Meta title={item.PK.S.replace('#PERSON#', '')} avatar={<PersonAvatar person_id={item.PK.S} />} />
              </List.Item>
            )}
          />
        </InfiniteScroll>
      )}
    </>
  )
}
