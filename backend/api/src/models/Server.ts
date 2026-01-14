import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ServerAttributes {
  id: string;
  name: string;
  location: string;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  ipAddress: string;
  domain?: string;
  protocol: 'wireguard' | 'openvpn' | 'both';
  port: number;
  capacity: number;
  currentLoad: number;
  status: 'online' | 'offline' | 'maintenance';
  wireguardPublicKey?: string;
  wireguardEndpoint?: string;
  openvpnConfig?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServerCreationAttributes extends Optional<ServerAttributes, 'id' | 'currentLoad' | 'status'> {}

class Server extends Model<ServerAttributes, ServerCreationAttributes> implements ServerAttributes {
  public id!: string;
  public name!: string;
  public location!: string;
  public country!: string;
  public city!: string;
  public latitude?: number;
  public longitude?: number;
  public ipAddress!: string;
  public domain?: string;
  public protocol!: 'wireguard' | 'openvpn' | 'both';
  public port!: number;
  public capacity!: number;
  public currentLoad!: number;
  public status!: 'online' | 'offline' | 'maintenance';
  public wireguardPublicKey?: string;
  public wireguardEndpoint?: string;
  public openvpnConfig?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Server.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
    },
    longitude: {
      type: DataTypes.FLOAT,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
    },
    protocol: {
      type: DataTypes.ENUM('wireguard', 'openvpn', 'both'),
      allowNull: false,
      defaultValue: 'wireguard',
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
    },
    currentLoad: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'maintenance'),
      defaultValue: 'online',
    },
    wireguardPublicKey: {
      type: DataTypes.TEXT,
    },
    wireguardEndpoint: {
      type: DataTypes.STRING,
    },
    openvpnConfig: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'servers',
    timestamps: true,
  }
);

export default Server;
