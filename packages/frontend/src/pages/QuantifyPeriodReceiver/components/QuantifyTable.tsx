import { InlineLabel } from '@/components/InlineLabel';
import { ForwarderTooltip } from '@/components/praise/ForwarderTooltip';
import { UserAvatar } from '@/components/user/UserAvatar';
import { UserPseudonym } from '@/components/user/UserPseudonym';
import { ActiveUserId } from '@/model/auth';
import {
  PeriodAndReceiverPageParams,
  PeriodQuantifierReceiverPraise,
} from '@/model/periods';
import { useQuantifyPraise } from '@/model/praise';
import { usePeriodSettingValueRealized } from '@/model/periodsettings';
import { localizeAndFormatIsoDate } from '@/utils/date';
import {
  faCopy,
  faTimes,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dialog } from '@headlessui/react';
import getWeek from 'date-fns/getWeek';
import parseISO from 'date-fns/parseISO';
import { groupBy } from 'lodash';
import { PraiseDto, QuantificationDto } from 'api/dist/praise/types';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { QuantifyBackNextLink } from './BackNextLink';
import DismissDialog from './DismissDialog';
import DuplicateDialog from './DuplicateDialog';
import QuantifySlider from './QuantifySlider';

const getRemoveButton = (callback: () => void): JSX.Element => {
  return (
    <button onClick={callback} className="ml-2">
      <FontAwesomeIcon
        className="text-white text-opacity-50 hover:text-opacity-100"
        icon={faTimes}
        size="1x"
      />
    </button>
  );
};

const QuantifyTable = (): JSX.Element | null => {
  const { periodId, receiverId } = useParams<PeriodAndReceiverPageParams>();
  const userId = useRecoilValue(ActiveUserId);
  const data = useRecoilValue(
    PeriodQuantifierReceiverPraise({ periodId, receiverId })
  );
  const usePseudonyms = usePeriodSettingValueRealized(
    periodId,
    'PRAISE_QUANTIFY_RECEIVER_PSEUDONYMS'
  ) as boolean;
  const { quantify } = useQuantifyPraise();

  const [isDismissDialogOpen, setIsDismissDialogOpen] = React.useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] =
    React.useState(false);
  const [selectedPraise, setSelectedPraise] = React.useState<
    PraiseDto | undefined
  >(undefined);

  if (!data) return null;

  const quantification = (praise: PraiseDto): QuantificationDto | undefined => {
    return praise.quantifications.find((q) => q.quantifier === userId);
  };

  const dismissed = (praise: PraiseDto): boolean => {
    const q = quantification(praise);
    return q ? !!q.dismissed : false;
  };

  const duplicate = (praise: PraiseDto): boolean => {
    const q = quantification(praise);
    return q ? (q.duplicatePraise ? true : false) : false;
  };

  const handleDismiss = (): void => {
    if (selectedPraise) void quantify(selectedPraise._id, 0, true, null);
  };

  const handleDuplicate = (duplicatePraiseId: string): void => {
    if (selectedPraise)
      void quantify(selectedPraise._id, 0, false, duplicatePraiseId);
  };

  const handleRemoveDismiss = (): void => {
    if (selectedPraise) void quantify(selectedPraise._id, 0, false, null);
  };

  const handleRemoveDuplicate = (): void => {
    if (selectedPraise) void quantify(selectedPraise._id, 0, false, null);
  };

  const shortDuplicatePraiseId = (praise: PraiseDto): string => {
    const q = quantification(praise);
    return q && q.duplicatePraise ? q.duplicatePraise?.slice(-4) : '';
  };

  const weeklyData = groupBy(data, (praise: PraiseDto) => {
    if (!praise) return 0;
    return getWeek(parseISO(praise.createdAt), { weekStartsOn: 1 });
  });

  return (
    <>
      <table className="w-full table-auto">
        <tbody>
          {Object.keys(weeklyData).map((weekKey, index) => (
            <>
              {index !== 0 && index !== data.length - 1 && (
                <tr>
                  <td colSpan={3}>
                    <div className="border-t border-2 border-gray-400 my-4" />
                  </td>
                </tr>
              )}

              {weeklyData[weekKey].map((praise, index) => (
                <tr
                  key={index}
                  onMouseDown={(): void => setSelectedPraise(praise)}
                >
                  <td>
                    <div className="items-center w-full">
                      <div className="flex items-center">
                        <UserAvatar
                          userAccount={praise.giver}
                          usePseudonym={usePseudonyms}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className="font-bold">
                        <ForwarderTooltip praise={praise} />
                        {usePseudonyms ? (
                          <UserPseudonym
                            userId={praise.giver._id}
                            periodId={periodId}
                          />
                        ) : (
                          praise.giver.name
                        )}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {localizeAndFormatIsoDate(praise.createdAt)}
                      </span>
                    </div>
                    <div className="w-[550px] overflow-hidden overflow-ellipsis">
                      <span>
                        <InlineLabel
                          text={`#${praise._id.slice(-4)}`}
                          className="bg-gray-400"
                        />
                        {dismissed(praise) ? (
                          <>
                            <InlineLabel
                              text="Dismissed"
                              button={getRemoveButton(handleRemoveDismiss)}
                              className="bg-red-600"
                            />
                            <span className="line-through">
                              {praise.reason}
                            </span>
                          </>
                        ) : duplicate(praise) ? (
                          <>
                            <InlineLabel
                              text={`Duplicate of: #${shortDuplicatePraiseId(
                                praise
                              )}`}
                              button={getRemoveButton(handleRemoveDuplicate)}
                            />
                            <span className="text-gray-400">
                              {praise.reason}
                            </span>
                          </>
                        ) : (
                          praise.reason
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex">
                      <QuantifySlider praise={praise} periodId={periodId} />
                      <button
                        className="pb-1 ml-4 hover:text-gray-400"
                        disabled={duplicate(praise)}
                        onClick={(): void => setIsDuplicateDialogOpen(true)}
                      >
                        <FontAwesomeIcon
                          icon={faCopy}
                          size="1x"
                          className={duplicate(praise) ? 'text-gray-400' : ''}
                        />
                      </button>
                      <button
                        className="pb-1 ml-1 hover:text-gray-400"
                        disabled={dismissed(praise)}
                        onClick={(): void => setIsDismissDialogOpen(true)}
                      >
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          size="1x"
                          className={dismissed(praise) ? 'text-gray-400' : ''}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </>
          ))}

          <React.Suspense fallback={null}>
            <Dialog
              open={isDismissDialogOpen && !!selectedPraise}
              onClose={(): void => setIsDismissDialogOpen(false)}
              className="fixed inset-0 z-10 overflow-y-auto"
            >
              <DismissDialog
                praise={selectedPraise}
                onClose={(): void => setIsDismissDialogOpen(false)}
                onDismiss={(): void => handleDismiss()}
              />
            </Dialog>
          </React.Suspense>

          <React.Suspense fallback={null}>
            <DuplicateDialog
              open={isDuplicateDialogOpen}
              praise={selectedPraise}
              onClose={(): void => setIsDuplicateDialogOpen(false)}
              onSelect={handleDuplicate}
            />
          </React.Suspense>
        </tbody>
      </table>
      <QuantifyBackNextLink />
    </>
  );
};

export default QuantifyTable;