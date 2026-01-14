import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface SubscriptionAttributes {
  id: string;
  userId: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  startDate: Date;
  endDate?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  autoRenew: boolean;
  price?: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'status' | 'autoRenew' | 'currency'> {}

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: string;
  public userId!: string;
  public plan!: 'free' | 'basic' | 'premium' | 'enterprise';
  public status!: 'active' | 'cancelled' | 'expired' | 'suspended';
  public startDate!: Date;
  public endDate?: Date;
  public stripeSubscriptionId?: string;
  public stripeCustomerId?: string;
  public autoRenew!: boolean;
  public price?: number;
  public currency!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    plan: {
      type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
      allowNull: false,
      defaultValue: 'free',
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'expired', 'suspended'),
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
  }
);

export default Subscription;
