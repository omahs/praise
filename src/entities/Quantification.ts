import mongoose from 'mongoose';
import { PraiseInterface } from './Praise';
import { UserInterface } from './User';

export interface QuantificationInterface {
  createdAt?: string;
  updatedAt?: string;
  quantifier: UserInterface;
  score?: number;
  dismissed?: boolean;
  duplicatePraise?: PraiseInterface | null;
}

export const quantificationSchema = new mongoose.Schema(
  {
    quantifier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    dismissed: { type: Boolean, default: false },
    duplicatePraise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Praise',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const QuantificationModel = mongoose.model<QuantificationInterface>(
  'Quantification',
  quantificationSchema
);

export default QuantificationModel;