import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import { UserService, userFilterSchema, createUserSchema, updateUserSchema } from '@/server/services/userService';
import { testDb, mockPrismaClient } from '../../utils/db';
import { createUser, createAdminUser } from '../../factories/userFactory';
import { UserRole, SubscriptionPlan } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: mockPrismaClient(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const mockBcrypt = vi.mocked(bcrypt);

describe('UserService', () => {
  beforeEach(() => {
    testDb.reset();
    vi.clearAllMocks();
    
    // Mock bcrypt.hash to return predictable results
    mockBcrypt.hash.mockImplementation(async (password) => `hashed_${password}`);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findUsers', () => {
    test('should find users with default filters', async () => {
      // Setup test data
      const testUsers = [
        createUser({ name: 'John Doe', email: 'john@example.com' }),
        createUser({ name: 'Jane Smith', email: 'jane@example.com' }),
      ];
      
      testUsers.forEach(user => testDb.create('user', user));

      const filter = userFilterSchema.parse({});
      const result = await UserService.findUsers(filter);

      expect(result.users).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.hasMore).toBe(false);
    });

    test('should filter users by search term', async () => {
      const users = [
        createUser({ name: 'John Doe', email: 'john@example.com' }),
        createUser({ name: 'Jane Smith', email: 'jane@example.com' }),
        createUser({ name: 'Bob Johnson', email: 'bob@example.com' }),
      ];
      
      users.forEach(user => testDb.create('user', user));

      const filter = userFilterSchema.parse({ search: 'john' });
      const result = await UserService.findUsers(filter);

      expect(result.users).toHaveLength(2); // John Doe and Bob Johnson
      expect(result.users.some(u => u.name === 'John Doe')).toBe(true);
      expect(result.users.some(u => u.name === 'Bob Johnson')).toBe(true);
    });

    test('should filter users by role', async () => {
      const users = [
        createUser({ role: 'USER' }),
        createAdminUser({ role: 'ADMIN' }),
        createUser({ role: 'PREMIUM' }),
      ];
      
      users.forEach(user => testDb.create('user', user));

      const filter = userFilterSchema.parse({ role: UserRole.ADMIN });
      const result = await UserService.findUsers(filter);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe('ADMIN');
    });

    test('should filter users by subscription plan', async () => {
      const users = [
        createUser({ subscriptionPlan: 'FREE' }),
        createUser({ subscriptionPlan: 'PREMIUM' }),
        createUser({ subscriptionPlan: 'FREE' }),
      ];
      
      users.forEach(user => testDb.create('user', user));

      const filter = userFilterSchema.parse({ 
        subscriptionPlan: SubscriptionPlan.PREMIUM 
      });
      const result = await UserService.findUsers(filter);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].subscriptionPlan).toBe('PREMIUM');
    });

    test('should filter by email verified status', async () => {
      const users = [
        createUser({ emailVerified: new Date() }),
        createUser({ emailVerified: null }),
        createUser({ emailVerified: new Date() }),
      ];
      
      users.forEach(user => testDb.create('user', user));

      const filter = userFilterSchema.parse({ emailVerified: true });
      const result = await UserService.findUsers(filter);

      expect(result.users).toHaveLength(2);
      result.users.forEach(user => {
        expect(user.emailVerified).not.toBeNull();
      });
    });

    test('should handle pagination correctly', async () => {
      const users = Array.from({ length: 25 }, () => createUser());
      users.forEach(user => testDb.create('user', user));

      const filter = userFilterSchema.parse({ limit: 10, offset: 0 });
      const firstPage = await UserService.findUsers(filter);

      expect(firstPage.users).toHaveLength(10);
      expect(firstPage.pagination.hasMore).toBe(true);

      const secondPageFilter = userFilterSchema.parse({ limit: 10, offset: 10 });
      const secondPage = await UserService.findUsers(secondPageFilter);

      expect(secondPage.users).toHaveLength(10);
      expect(secondPage.pagination.hasMore).toBe(true);
    });

    test('should sort users by different fields', async () => {
      const users = [
        createUser({ name: 'Alice', createdAt: new Date('2024-01-01') }),
        createUser({ name: 'Bob', createdAt: new Date('2024-01-02') }),
        createUser({ name: 'Charlie', createdAt: new Date('2024-01-03') }),
      ];
      
      users.forEach(user => testDb.create('user', user));

      // Test name sorting
      const nameFilter = userFilterSchema.parse({ 
        sortBy: 'name', 
        sortOrder: 'asc' 
      });
      const nameResult = await UserService.findUsers(nameFilter);

      expect(nameResult.users[0].name).toBe('Alice');
      expect(nameResult.users[1].name).toBe('Bob');
      expect(nameResult.users[2].name).toBe('Charlie');

      // Test date sorting
      const dateFilter = userFilterSchema.parse({ 
        sortBy: 'createdAt', 
        sortOrder: 'desc' 
      });
      const dateResult = await UserService.findUsers(dateFilter);

      expect(dateResult.users[0].name).toBe('Charlie');
      expect(dateResult.users[2].name).toBe('Alice');
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      vi.mocked(testDb.findMany).mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const filter = userFilterSchema.parse({});

      await expect(UserService.findUsers(filter)).rejects.toThrow(TRPCError);
    });
  });

  describe('getUserById', () => {
    test('should return user details by ID', async () => {
      const user = createUser();
      testDb.create('user', user);

      const result = await UserService.getUserById(user.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    test('should return null for non-existent user', async () => {
      const result = await UserService.getUserById('non-existent-id');

      expect(result).toBeNull();
    });

    test('should handle database errors', async () => {
      vi.mocked(testDb.findUnique).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(UserService.getUserById('user-id')).rejects.toThrow(TRPCError);
    });
  });

  describe('createUser', () => {
    test('should create a new user successfully', async () => {
      const userData = createUserSchema.parse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const result = await UserService.createUser(userData);

      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.role).toBe(UserRole.USER);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    test('should create user without password', async () => {
      const userData = createUserSchema.parse({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      const result = await UserService.createUser(userData);

      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane@example.com');
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
    });

    test('should throw error for duplicate email', async () => {
      const existingUser = createUser({ email: 'existing@example.com' });
      testDb.create('user', existingUser);

      const userData = createUserSchema.parse({
        name: 'New User',
        email: 'existing@example.com',
      });

      await expect(UserService.createUser(userData)).rejects.toThrow(
        expect.objectContaining({
          code: 'CONFLICT',
          message: 'このメールアドレスは既に使用されています',
        })
      );
    });

    test('should create admin user with correct role', async () => {
      const userData = createUserSchema.parse({
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });

      const result = await UserService.createUser(userData);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    test('should set default subscription plan', async () => {
      const userData = createUserSchema.parse({
        name: 'Free User',
        email: 'free@example.com',
      });

      const result = await UserService.createUser(userData);

      expect(result.subscriptionPlan).toBe(SubscriptionPlan.FREE);
    });

    test('should log user creation activity', async () => {
      const userData = createUserSchema.parse({
        name: 'John Doe',
        email: 'john@example.com',
      });

      const creatorId = 'creator-123';
      await UserService.createUser(userData, creatorId);

      // Verify activity log was created
      const activities = testDb.findMany('userActivity', { userId: creatorId });
      expect(activities).toHaveLength(1);
      expect(activities[0].action).toBe('USER_CREATED');
    });
  });

  describe('updateUser', () => {
    test('should update user successfully', async () => {
      const user = createUser();
      testDb.create('user', user);

      const updateData = updateUserSchema.parse({
        name: 'Updated Name',
        bio: 'Updated bio',
      });

      const result = await UserService.updateUser(user.id, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.bio).toBe('Updated bio');
    });

    test('should prevent duplicate email during update', async () => {
      const user1 = createUser({ email: 'user1@example.com' });
      const user2 = createUser({ email: 'user2@example.com' });
      
      testDb.create('user', user1);
      testDb.create('user', user2);

      const updateData = updateUserSchema.parse({
        email: 'user1@example.com',
      });

      await expect(
        UserService.updateUser(user2.id, updateData)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'CONFLICT',
          message: 'このメールアドレスは既に使用されています',
        })
      );
    });

    test('should allow updating email to same email', async () => {
      const user = createUser({ email: 'same@example.com' });
      testDb.create('user', user);

      const updateData = updateUserSchema.parse({
        name: 'Updated Name',
        email: 'same@example.com',
      });

      const result = await UserService.updateUser(user.id, updateData);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('same@example.com');
    });

    test('should validate Twitter handle format', async () => {
      const user = createUser();
      testDb.create('user', user);

      // Valid Twitter handle
      const validUpdate = updateUserSchema.parse({
        twitter: '@validhandle',
      });
      
      await expect(
        UserService.updateUser(user.id, validUpdate)
      ).resolves.not.toThrow();

      // Invalid Twitter handle
      expect(() => {
        updateUserSchema.parse({
          twitter: 'invalid@handle@format',
        });
      }).toThrow();
    });

    test('should log update activity', async () => {
      const user = createUser();
      testDb.create('user', user);

      const updateData = updateUserSchema.parse({
        name: 'Updated Name',
      });

      const updaterId = 'updater-123';
      await UserService.updateUser(user.id, updateData, updaterId);

      const activities = testDb.findMany('userActivity', { userId: updaterId });
      expect(activities).toHaveLength(1);
      expect(activities[0].action).toBe('USER_UPDATED');
      expect(activities[0].details.updatedFields).toContain('name');
    });
  });

  describe('deleteUser', () => {
    test('should soft delete user successfully', async () => {
      const user = createUser();
      testDb.create('user', user);

      await UserService.deleteUser(user.id);

      const updatedUser = testDb.findUnique('user', { id: user.id });
      expect(updatedUser.deletedAt).toBeTruthy();
      expect(updatedUser.email).toContain('deleted_');
    });

    test('should prevent deleting non-existent user', async () => {
      await expect(
        UserService.deleteUser('non-existent-id')
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'ユーザーが見つかりません',
        })
      );
    });

    test('should prevent deleting last admin', async () => {
      const adminUser = createAdminUser();
      testDb.create('user', adminUser);

      await expect(
        UserService.deleteUser(adminUser.id)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: '最後の管理者は削除できません',
        })
      );
    });

    test('should allow deleting admin when other admins exist', async () => {
      const admin1 = createAdminUser({ id: 'admin1' });
      const admin2 = createAdminUser({ id: 'admin2' });
      
      testDb.create('user', admin1);
      testDb.create('user', admin2);

      await expect(
        UserService.deleteUser(admin1.id)
      ).resolves.not.toThrow();
    });

    test('should log deletion activity', async () => {
      const user = createUser();
      testDb.create('user', user);

      const deleterId = 'deleter-123';
      await UserService.deleteUser(user.id, deleterId);

      const activities = testDb.findMany('userActivity', { userId: deleterId });
      expect(activities).toHaveLength(1);
      expect(activities[0].action).toBe('USER_DELETED');
      expect(activities[0].details.deletedUserId).toBe(user.id);
    });
  });

  describe('getUserStats', () => {
    test('should return comprehensive user statistics', async () => {
      // Create test data
      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getTime() - 35 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000);

      const users = [
        createUser({ 
          role: 'USER', 
          subscriptionPlan: 'FREE',
          createdAt: thisMonth,
          lastLoginAt: new Date(),
        }),
        createUser({ 
          role: 'PREMIUM', 
          subscriptionPlan: 'PREMIUM',
          createdAt: lastMonth,
          lastLoginAt: new Date(),
        }),
        createAdminUser({ 
          role: 'ADMIN', 
          subscriptionPlan: 'FREE',
          createdAt: lastMonth,
          lastLoginAt: lastMonth, // Not active
        }),
      ];

      users.forEach(user => testDb.create('user', user));

      const stats = await UserService.getUserStats();

      expect(stats.totalUsers).toBe(3);
      expect(stats.activeUsers).toBe(2); // Last 30 days
      expect(stats.newUsersThisMonth).toBe(1);
      expect(stats.usersByRole.USER).toBe(1);
      expect(stats.usersByRole.PREMIUM).toBe(1);
      expect(stats.usersByRole.ADMIN).toBe(1);
      expect(stats.usersBySubscription.FREE).toBe(2);
      expect(stats.usersBySubscription.PREMIUM).toBe(1);
    });

    test('should handle empty database', async () => {
      const stats = await UserService.getUserStats();

      expect(stats.totalUsers).toBe(0);
      expect(stats.activeUsers).toBe(0);
      expect(stats.newUsersThisMonth).toBe(0);
      expect(stats.topLearners).toHaveLength(0);
    });

    test('should calculate top learners correctly', async () => {
      const users = [
        createUser({ name: 'High Learner' }),
        createUser({ name: 'Medium Learner' }),
        createUser({ name: 'Low Learner' }),
      ];

      users.forEach(user => testDb.create('user', user));

      // Mock learning progress
      testDb.create('learningProgress', {
        userId: users[0].id,
        totalStudyTime: 10000,
      });
      testDb.create('learningProgress', {
        userId: users[1].id,
        totalStudyTime: 5000,
      });
      testDb.create('learningProgress', {
        userId: users[2].id,
        totalStudyTime: 1000,
      });

      const stats = await UserService.getUserStats();

      expect(stats.topLearners).toHaveLength(3);
      expect(stats.topLearners[0].name).toBe('High Learner');
      expect(stats.topLearners[0].totalStudyTime).toBe(10000);
    });
  });

  describe('changeUserRole', () => {
    test('should change user role successfully', async () => {
      const user = createUser({ role: 'USER' });
      testDb.create('user', user);

      const result = await UserService.changeUserRole(
        user.id, 
        UserRole.PREMIUM,
        'admin-123'
      );

      expect(result.role).toBe(UserRole.PREMIUM);
    });

    test('should prevent changing last admin role', async () => {
      const adminUser = createAdminUser();
      testDb.create('user', adminUser);

      await expect(
        UserService.changeUserRole(adminUser.id, UserRole.USER)
      ).rejects.toThrow(
        expect.objectContaining({
          code: 'FORBIDDEN',
          message: '最後の管理者の権限は変更できません',
        })
      );
    });

    test('should allow changing admin role when other admins exist', async () => {
      const admin1 = createAdminUser({ id: 'admin1' });
      const admin2 = createAdminUser({ id: 'admin2' });
      
      testDb.create('user', admin1);
      testDb.create('user', admin2);

      const result = await UserService.changeUserRole(admin1.id, UserRole.USER);

      expect(result.role).toBe(UserRole.USER);
    });

    test('should log role change activity', async () => {
      const user = createUser({ role: 'USER' });
      testDb.create('user', user);

      const changerId = 'admin-123';
      await UserService.changeUserRole(user.id, UserRole.PREMIUM, changerId);

      const activities = testDb.findMany('userActivity', { userId: changerId });
      expect(activities).toHaveLength(1);
      expect(activities[0].action).toBe('USER_ROLE_CHANGED');
      expect(activities[0].details.oldRole).toBe('USER');
      expect(activities[0].details.newRole).toBe('PREMIUM');
    });
  });

  describe('batchUpdateUsers', () => {
    test('should update multiple users successfully', async () => {
      const users = [
        createUser({ id: 'user1', name: 'User 1' }),
        createUser({ id: 'user2', name: 'User 2' }),
        createUser({ id: 'user3', name: 'User 3' }),
      ];

      users.forEach(user => testDb.create('user', user));

      const updates = { bio: 'Updated bio' };
      const result = await UserService.batchUpdateUsers(
        ['user1', 'user2', 'user3'],
        updates,
        'admin-123'
      );

      expect(result.updated).toBe(3);
      expect(result.errors).toHaveLength(0);

      // Verify updates
      users.forEach(user => {
        const updatedUser = testDb.findUnique('user', { id: user.id });
        expect(updatedUser.bio).toBe('Updated bio');
      });
    });

    test('should handle partial failures gracefully', async () => {
      const users = [
        createUser({ id: 'user1' }),
        createUser({ id: 'user2' }),
        // user3 doesn't exist
      ];

      users.forEach(user => testDb.create('user', user));

      const updates = { bio: 'Updated bio' };
      const result = await UserService.batchUpdateUsers(
        ['user1', 'user2', 'user3-nonexistent'],
        updates
      );

      expect(result.updated).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('user3-nonexistent');
    });

    test('should handle empty user list', async () => {
      const result = await UserService.batchUpdateUsers([], { bio: 'test' });

      expect(result.updated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Schema Validation', () => {
    test('should validate user filter schema', () => {
      // Valid filter
      const validFilter = userFilterSchema.parse({
        search: 'john',
        role: UserRole.USER,
        limit: 10,
        offset: 0,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(validFilter.search).toBe('john');
      expect(validFilter.limit).toBe(10);

      // Invalid filter
      expect(() => {
        userFilterSchema.parse({
          limit: 200, // exceeds max
        });
      }).toThrow();

      expect(() => {
        userFilterSchema.parse({
          sortBy: 'invalid_field',
        });
      }).toThrow();
    });

    test('should validate create user schema', () => {
      // Valid data
      const validData = createUserSchema.parse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(validData.email).toBe('john@example.com');

      // Invalid data
      expect(() => {
        createUserSchema.parse({
          name: 'J', // too short
          email: 'invalid-email',
        });
      }).toThrow();

      expect(() => {
        createUserSchema.parse({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123', // too short
        });
      }).toThrow();
    });

    test('should validate update user schema', () => {
      // Valid update
      const validUpdate = updateUserSchema.parse({
        name: 'Updated Name',
        bio: 'This is my bio',
        website: 'https://example.com',
        twitter: '@username',
      });

      expect(validUpdate.name).toBe('Updated Name');

      // Invalid updates
      expect(() => {
        updateUserSchema.parse({
          website: 'not-a-url',
        });
      }).toThrow();

      expect(() => {
        updateUserSchema.parse({
          twitter: 'invalid-twitter-handle-too-long',
        });
      }).toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', async () => {
      // Mock database error
      vi.mocked(testDb.findMany).mockImplementationOnce(() => {
        throw new Error('Database connection lost');
      });

      const filter = userFilterSchema.parse({});

      await expect(UserService.findUsers(filter)).rejects.toThrow(
        expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
        })
      );
    });

    test('should preserve original TRPCError codes', async () => {
      const user = createUser();
      testDb.create('user', user);

      // This should throw a CONFLICT error, which should be preserved
      const userData = createUserSchema.parse({
        name: 'Duplicate User',
        email: user.email, // Duplicate email
      });

      await expect(UserService.createUser(userData)).rejects.toThrow(
        expect.objectContaining({
          code: 'CONFLICT',
        })
      );
    });

    test('should handle bcrypt errors gracefully', async () => {
      mockBcrypt.hash.mockRejectedValue(new Error('Bcrypt failed'));

      const userData = createUserSchema.parse({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      await expect(UserService.createUser(userData)).rejects.toThrow(TRPCError);
    });
  });
});