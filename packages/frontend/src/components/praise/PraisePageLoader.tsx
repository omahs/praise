import React, { useCallback, useState, useEffect } from 'react';
import { BottomScrollListener } from 'react-bottom-scroll-listener';
import { useRecoilValue } from 'recoil';
import { AllPraiseQueryPagination, useAllPraiseQuery } from '@/model/praise';
import { LoaderSpinner } from '@/components/LoaderSpinner';
import { PRAISE_LIST_KEY } from '../../pages/Start/components/PraiseTable';

interface Params {
  listKey?: string;
  receiverId?: string;
}

export const PraisePageLoader = ({
  listKey = PRAISE_LIST_KEY,
  receiverId,
}: Params): JSX.Element => {
  const praisePagination = useRecoilValue(AllPraiseQueryPagination(listKey));
  const [nextPageNumber, setNextPageNumber] = useState<number>(
    praisePagination.currentPage + 1
  );
  const receiverIdQuery = receiverId ? { receiver: receiverId } : {};
  const queryResponse = useAllPraiseQuery(
    {
      page: nextPageNumber,
      limit: 20,
      sortColumn: 'createdAt',
      sortType: 'desc',
      ...receiverIdQuery,
    },
    listKey
  );
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    setLoading(false);
  }, [queryResponse]);

  const handleContainerOnBottom = useCallback(() => {
    if (loading || praisePagination.currentPage === praisePagination.totalPages)
      return;

    setLoading(true);
    setNextPageNumber(praisePagination.currentPage + 1);
  }, [praisePagination, loading, setNextPageNumber]);

  if (loading)
    return (
      <div className="pb-20">
        <LoaderSpinner />
      </div>
    );

  /* This will trigger handleOnDocumentBottom when the body of the page hits the bottom */
  return <BottomScrollListener onBottom={handleContainerOnBottom} />;
};