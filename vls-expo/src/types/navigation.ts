// vls-expo/src/types/navigation.ts
import { StackScreenProps } from '@react-navigation/stack';

export type CTFStackParamList = {
  CTFList: undefined;
  CTFDetail: { challengeId: number; challengeTitle: string };
};

export type CTFListScreenProps = StackScreenProps<CTFStackParamList, 'CTFList'>;
export type CTFDetailScreenProps = StackScreenProps<CTFStackParamList, 'CTFDetail'>;

export type AdminStackParamList = {
  AdminDashboard: undefined;
  ManageChallenges: undefined;
  EditChallenge: { challengeId: number | undefined };
};
