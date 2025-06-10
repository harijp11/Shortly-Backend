import mongoose, { Schema, Document } from "mongoose";

// Click tracking interface
interface IClick {
  timestamp: Date;
  referrer: string;
  userAgent: string;
  ip: string;
  country: string;
}

// URL document interface
export interface IUrl extends Document {
  shortUrl: string;
  longUrl: string;
  shortCode: string;
  customUrl?: string;
  userId?: mongoose.Types.ObjectId;
  clicks: IClick[];
  createdAt: Date;
  totalClicks: number;
  lastClicked?: Date; // Add for frontend compatibility
}

// Main URL schema
const UrlSchema: Schema = new Schema({
  shortUrl: { 
    type: String, 
    required: true 
  },
  longUrl: { 
    type: String, 
    required: true 
  },
  shortCode: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  customUrl: { 
    type: String, 
    default: null 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  clicks: [{
    timestamp: { 
      type: Date, 
      default: Date.now 
    },
    referrer: { 
      type: String, 
      default: 'Direct' 
    },
    userAgent: { 
      type: String, 
      default: 'Unknown' 
    },
    ip: { 
      type: String, 
      default: 'Unknown' 
    },
    country: { 
      type: String, 
      default: 'Unknown' 
    }
  }],
  totalClicks:{
    type: Number,
    default:0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastClicked: {
    type: Date,
    default: null
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// UrlSchema.virtual('totalClicks').get(function(this: IUrl) {
//   return this.clicks ? this.clicks.length : 0;
// });

UrlSchema.index({ userId: 1, createdAt: -1 });
UrlSchema.index({ shortCode: 1 });

export const Url = mongoose.model<IUrl>('Url', UrlSchema);