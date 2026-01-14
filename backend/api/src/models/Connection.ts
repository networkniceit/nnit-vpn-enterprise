import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ConnectionAttributes {
  id: string;
  userId: string;
  serverId: string;
  protocol: 'wireguard' | 'openvpn';
  connectedAt: Date;
  disconnectedAt?: Date;
  bytesReceived?: number;
  bytesSent?: number;
  duration?: number;
  ipAddress?: string;
  status: 'active' | 'disconnected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConnectionCreationAttributes extends Optional<ConnectionAttributes, 'id' | 'status'> {}

class Connection extends Model<ConnectionAttributes, ConnectionCreationAttributes> implements ConnectionAttributes {
  public id!: string;
  public userId!: string;
  public serverId!: string;
  public protocol!: 'wireguard' | 'openvpn';
  public connectedAt!: Date;
  public disconnectedAt?: Date;
  public bytesReceived?: number;
  public bytesSent?: number;
  public duration?: number;
  public ipAddress?: string;
  public status!: 'active' | 'disconnected';
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Connection.init(
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
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'servers',
        key: 'id',
      },
    },
    protocol: {
      type: DataTypes.ENUM('wireguard', 'openvpn'),
      allowNull: false,
    },
    connectedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    disconnectedAt: {
      type: DataTypes.DATE,
    },
    bytesReceived: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    bytesSent: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('active', 'disconnected'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'connections',
    timestamps: true,
  }
);

export default Connection;
