import enum
from datetime import datetime
from core.database import Base
from sqlalchemy import DateTime, ForeignKey, String, Enum, func, DECIMAL, BigInteger, TEXT
from sqlalchemy.orm import Mapped, mapped_column

class UserRole(enum.Enum):
    ADMIN = 'admin'
    MANAGER = 'manager'
    MASTER = 'master'

class Status(enum.Enum):
    NEW = 'new'
    IN_PROGRESS = 'in_progress'
    READY = 'ready'
    COMPLETED = 'completed'

class User(Base):
    __tablename__= "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True)
    hashed_password: Mapped[str]
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=True))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

class Client(Base):
    __tablename__= "clients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))
    phone: Mapped[str] = mapped_column(String(20), unique=True)
    telegram_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    notes: Mapped[str | None] = mapped_column(TEXT)

class Device(Base):
    __tablename__= "devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    client_id: Mapped[int] = mapped_column(ForeignKey('clients.id'))
    model: Mapped[str] = mapped_column(String(50))
    type: Mapped[str] = mapped_column(String(20))
    serial_number: Mapped[str | None] = mapped_column(String(255))

class Order(Base):
    __tablename__= "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[int] = mapped_column(ForeignKey('devices.id'))
    master_id: Mapped[int | None] = mapped_column(ForeignKey('users.id'))
    status: Mapped[Status] = mapped_column(Enum(Status, native_enum=True))
    description: Mapped[str] = mapped_column(String(255))
    total_price: Mapped[float] = mapped_column(DECIMAL(10, 2))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

class Part(Base):
    __tablename__= "parts"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    quantity: Mapped[int] = mapped_column(default=0)
    buy_price: Mapped[float] = mapped_column(DECIMAL(10, 2))
    sell_price: Mapped[float] = mapped_column(DECIMAL(10, 2))

class OrderParts(Base):
    __tablename__= "order_parts"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id'))
    part_id: Mapped[int] = mapped_column(ForeignKey('parts.id'))
    quantity: Mapped[int] = mapped_column(default=1)
    price: Mapped[float] = mapped_column(DECIMAL(10, 2))

class RefreshToken(Base):
    __tablename__="refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    token: Mapped[str]
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, native_enum=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))