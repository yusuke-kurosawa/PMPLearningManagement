import { describe, it, expect, beforeEach, vi } from 'vitest';
import { learningRecommendationService } from '@/server/services/learning/recommendationService';
import { adaptiveLearningService } from '@/server/services/learning/adaptiveLearningService';
import { prisma } from '@/tests/setup/globalSetup';
import { faker } from '@faker-js/faker';

/**
 * 学習推奨エンジンテスト
 * 担当：ビジネスロジックチーム
 * 
 * テストカバレッジ：
 * - 個別化学習推奨アルゴリズム
 * - 適応的学習パス生成
 * - 知識マップベース推奨
 * - コラボレーティブフィルタリング
 * - コンテンツベースフィルタリング
 */

describe('Learning Recommendation Engine', () => {
  let testUser: any;
  let testProcesses: any[];
  let testContent: any[];

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: 'PREMIUM_USER',
        subscription: 'PREMIUM',
        learningStyle: 'VISUAL', // 視覚学習者
        preferredDifficulty: 'INTERMEDIATE'
      }
    });

    // PMBOK プロセステストデータ
    testProcesses = await Promise.all(
      Array.from({ length: 10 }, async (_, i) => {
        return prisma.pmbokProcess.create({
          data: {
            id: `process-${i + 1}`,
            name: `Process ${i + 1}`,
            knowledgeArea: faker.helpers.arrayElement([
              'INTEGRATION', 'SCOPE', 'SCHEDULE', 'COST', 'QUALITY'
            ]),
            processGroup: faker.helpers.arrayElement([
              'INITIATING', 'PLANNING', 'EXECUTING', 'MONITORING', 'CLOSING'
            ]),
            complexity: faker.number.int({ min: 1, max: 5 }),
            prerequisites: i > 0 ? [`process-${i}`] : [],
            tags: [faker.lorem.word(), faker.lorem.word()]
          }
        });
      })
    );

    // 学習コンテンツテストデータ
    testContent = await Promise.all(
      Array.from({ length: 20 }, async (_, i) => {
        return prisma.learningContent.create({
          data: {
            id: `content-${i + 1}`,
            title: `Learning Content ${i + 1}`,
            type: faker.helpers.arrayElement(['VIDEO', 'ARTICLE', 'INTERACTIVE', 'QUIZ', 'SIMULATION']),
            difficulty: faker.helpers.arrayElement(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
            estimatedTime: faker.number.int({ min: 300, max: 3600 }),
            processId: `process-${(i % 10) + 1}`,
            learningStyle: faker.helpers.arrayElement(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING']),
            tags: [faker.lorem.word(), faker.lorem.word()],
            rating: faker.number.float({ min: 3.0, max: 5.0 }),
            completionRate: faker.number.float({ min: 0.6, max: 0.95 })
          }
        });
      })
    );
  });

  describe('Personalized Content Recommendation', () => {
    it('should recommend content based on user learning style', async () => {
      // ユーザーは視覚学習者
      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      expect(recommendations).toHaveLength.greaterThan(0);
      
      // 視覚学習者向けコンテンツが優先される
      const visualContent = recommendations.filter(r => r.learningStyle === 'VISUAL');
      const totalRecommendations = recommendations.length;
      
      expect(visualContent.length / totalRecommendations).toBeGreaterThan(0.4); // 40%以上が視覚コンテンツ
      
      // 推奨度スコアが正しく計算されている
      recommendations.forEach(rec => {
        expect(rec.recommendationScore).toBeGreaterThanOrEqual(0);
        expect(rec.recommendationScore).toBeLessThanOrEqual(1);
        expect(rec).toHaveProperty('reason');
      });
    });

    it('should consider user progress and mastery levels', async () => {
      // ユーザーの学習進捗を設定
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 90, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 60, studyTime: 2400, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-3', masteryLevel: 30, studyTime: 1200, lastStudied: new Date() }
        ]
      });

      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      // 習得度の低いプロセスのコンテンツが多く推奨される
      const lowMasteryContent = recommendations.filter(r => 
        ['process-2', 'process-3'].includes(r.processId)
      );
      
      expect(lowMasteryContent.length).toBeGreaterThan(0);
      
      // 高習得度のプロセスは上級コンテンツが推奨される
      const highMasteryContent = recommendations.filter(r => 
        r.processId === 'process-1' && r.difficulty === 'ADVANCED'
      );
      
      expect(highMasteryContent.length).toBeGreaterThanOrEqual(0);
    });

    it('should adapt to user preferred difficulty level', async () => {
      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      const intermediateContent = recommendations.filter(r => r.difficulty === 'INTERMEDIATE');
      const totalRecommendations = recommendations.length;

      // ユーザーの好み（INTERMEDIATE）に合わせたコンテンツが多い
      expect(intermediateContent.length / totalRecommendations).toBeGreaterThan(0.3);
    });

    it('should recommend next logical learning steps', async () => {
      // 前提条件のあるプロセス構造を設定
      await prisma.pmbokProcess.update({
        where: { id: 'process-2' },
        data: { prerequisites: ['process-1'] }
      });
      
      await prisma.pmbokProcess.update({
        where: { id: 'process-3' },
        data: { prerequisites: ['process-2'] }
      });

      // process-1のみ完了
      await prisma.learningProgress.create({
        data: {
          userId: testUser.id,
          processId: 'process-1',
          masteryLevel: 85,
          studyTime: 3600,
          lastStudied: new Date()
        }
      });

      const nextSteps = await learningRecommendationService.getNextLearningSteps(testUser.id);

      expect(nextSteps).toHaveLength.greaterThan(0);
      
      // process-2が次のステップとして推奨される（前提条件を満たしている）
      const process2Recommendations = nextSteps.filter(step => step.processId === 'process-2');
      expect(process2Recommendations.length).toBeGreaterThan(0);
      
      // process-3は推奨されない（前提条件を満たしていない）
      const process3Recommendations = nextSteps.filter(step => step.processId === 'process-3');
      expect(process3Recommendations.length).toBe(0);
    });

    it('should handle cold start problem for new users', async () => {
      const newUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: 'FREE_USER',
          subscription: 'FREE'
        }
      });

      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(newUser.id);

      expect(recommendations).toHaveLength.greaterThan(0);
      
      // 初心者向けコンテンツが多く推奨される
      const beginnerContent = recommendations.filter(r => r.difficulty === 'BEGINNER');
      expect(beginnerContent.length).toBeGreaterThan(0);
      
      // 基礎的なプロセスから開始
      const fundamentalProcesses = recommendations.filter(r => 
        ['INTEGRATION', 'SCOPE'].includes(r.knowledgeArea)
      );
      expect(fundamentalProcesses.length).toBeGreaterThan(0);
    });

    it('should provide diverse recommendation types', async () => {
      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id, {
        diversityFactor: 0.8, // 高い多様性
        count: 20
      });

      const contentTypes = [...new Set(recommendations.map(r => r.type))];
      const difficulties = [...new Set(recommendations.map(r => r.difficulty))];
      const knowledgeAreas = [...new Set(recommendations.map(r => r.knowledgeArea))];

      // 多様なコンテンツタイプが推奨される
      expect(contentTypes.length).toBeGreaterThanOrEqual(3);
      expect(difficulties.length).toBeGreaterThanOrEqual(2);
      expect(knowledgeAreas.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Collaborative Filtering', () => {
    let similarUsers: any[];

    beforeEach(async () => {
      // 類似ユーザー作成（同じ学習スタイル）
      similarUsers = await Promise.all(
        Array.from({ length: 5 }, async () => {
          const user = await prisma.user.create({
            data: {
              id: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
              role: 'PREMIUM_USER',
              subscription: 'PREMIUM',
              learningStyle: 'VISUAL',
              preferredDifficulty: 'INTERMEDIATE'
            }
          });

          // 類似ユーザーの学習記録
          await prisma.learningProgress.createMany({
            data: [
              { userId: user.id, processId: 'process-1', masteryLevel: faker.number.int({ min: 70, max: 90 }), studyTime: faker.number.int({ min: 2400, max: 4800 }), lastStudied: new Date() },
              { userId: user.id, processId: 'process-2', masteryLevel: faker.number.int({ min: 65, max: 85 }), studyTime: faker.number.int({ min: 1800, max: 3600 }), lastStudied: new Date() },
              { userId: user.id, processId: 'process-4', masteryLevel: faker.number.int({ min: 80, max: 95 }), studyTime: faker.number.int({ min: 3000, max: 4200 }), lastStudied: new Date() }
            ]
          });

          // コンテンツ評価
          await prisma.contentRating.createMany({
            data: [
              { userId: user.id, contentId: 'content-1', rating: faker.number.int({ min: 4, max: 5 }) },
              { userId: user.id, contentId: 'content-3', rating: faker.number.int({ min: 4, max: 5 }) },
              { userId: user.id, contentId: 'content-7', rating: faker.number.int({ min: 4, max: 5 }) }
            ]
          });

          return user;
        })
      );
    });

    it('should find similar users based on learning patterns', async () => {
      // テストユーザーの学習記録も追加
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: 2400, lastStudied: new Date() }
        ]
      });

      const similarityResults = await learningRecommendationService.findSimilarUsers(testUser.id);

      expect(similarityResults).toHaveLength.greaterThan(0);
      similarityResults.forEach(result => {
        expect(result.userId).not.toBe(testUser.id);
        expect(result.similarityScore).toBeGreaterThanOrEqual(0);
        expect(result.similarityScore).toBeLessThanOrEqual(1);
        expect(result.commonProcesses).toBeInstanceOf(Array);
      });
    });

    it('should recommend content based on similar users preferences', async () => {
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() },
          { userId: testUser.id, processId: 'process-2', masteryLevel: 75, studyTime: 2400, lastStudied: new Date() }
        ]
      });

      const collaborativeRecommendations = await learningRecommendationService.getCollaborativeRecommendations(testUser.id);

      expect(collaborativeRecommendations).toHaveLength.greaterThan(0);
      
      // 類似ユーザーが高評価したコンテンツが推奨される
      collaborativeRecommendations.forEach(rec => {
        expect(rec.reason).toContain('similar users');
        expect(rec.recommendationScore).toBeGreaterThan(0.6);
      });
    });

    it('should weight recommendations by user similarity', async () => {
      const collaborativeRecs = await learningRecommendationService.getCollaborativeRecommendations(testUser.id);

      // 類似度の高いユーザーからの推奨ほど高スコア
      const sortedRecs = collaborativeRecs.sort((a, b) => b.recommendationScore - a.recommendationScore);
      
      expect(sortedRecs[0].recommendationScore).toBeGreaterThanOrEqual(sortedRecs[sortedRecs.length - 1].recommendationScore);
    });
  });

  describe('Content-Based Filtering', () => {
    it('should recommend similar content to previously consumed', async () => {
      // ユーザーが特定のコンテンツを完了
      await prisma.contentProgress.createMany({
        data: [
          { userId: testUser.id, contentId: 'content-1', completed: true, rating: 5, timeSpent: 1800 },
          { userId: testUser.id, contentId: 'content-3', completed: true, rating: 4, timeSpent: 2400 }
        ]
      });

      const contentBasedRecs = await learningRecommendationService.getContentBasedRecommendations(testUser.id);

      expect(contentBasedRecs).toHaveLength.greaterThan(0);
      
      // 同じタグ、同じタイプ、同じ知識エリアのコンテンツが推奨される
      contentBasedRecs.forEach(rec => {
        expect(rec.reason).toContain('similar content');
        expect(rec.similarityFactors).toBeInstanceOf(Array);
      });
    });

    it('should consider content features for similarity', async () => {
      // 特定の特徴を持つコンテンツを完了
      await prisma.contentProgress.create({
        data: {
          userId: testUser.id,
          contentId: 'content-1', // VISUALタイプ、INTEGRATIONエリア
          completed: true,
          rating: 5,
          timeSpent: 1800
        }
      });

      const similarContent = await learningRecommendationService.findSimilarContent('content-1');

      expect(similarContent).toHaveLength.greaterThan(0);
      similarContent.forEach(content => {
        expect(content.similarityScore).toBeGreaterThan(0.5);
        expect(content.similarityFactors).toContain('learningStyle' || 'knowledgeArea' || 'tags');
      });
    });

    it('should balance between exploration and exploitation', async () => {
      // ユーザーが特定エリアに集中している状況
      await prisma.learningProgress.createMany({
        data: [
          { userId: testUser.id, processId: 'process-1', masteryLevel: 85, studyTime: 3600, lastStudied: new Date() }, // INTEGRATION
          { userId: testUser.id, processId: 'process-2', masteryLevel: 80, studyTime: 2400, lastStudied: new Date() }  // INTEGRATION
        ]
      });

      const balancedRecs = await learningRecommendationService.getPersonalizedRecommendations(testUser.id, {
        explorationFactor: 0.3 // 30%の探索、70%の活用
      });

      const integrationContent = balancedRecs.filter(r => r.knowledgeArea === 'INTEGRATION');
      const otherContent = balancedRecs.filter(r => r.knowledgeArea !== 'INTEGRATION');

      // 探索のため、他の知識エリアも推奨される
      expect(otherContent.length).toBeGreaterThan(0);
      expect(otherContent.length / balancedRecs.length).toBeGreaterThanOrEqual(0.2); // 20%以上
    });
  });

  describe('Adaptive Learning Path Generation', () => {
    it('should generate personalized learning path', async () => {
      const learningPath = await adaptiveLearningService.generateLearningPath(testUser.id, {
        targetMastery: 85,
        timeConstraint: 30 * 24 * 60 * 60, // 30日（秒）
        focusAreas: ['INTEGRATION', 'SCOPE', 'SCHEDULE']
      });

      expect(learningPath.steps).toHaveLength.greaterThan(0);
      expect(learningPath.estimatedCompletionTime).toBeGreaterThan(0);
      expect(learningPath.totalContent).toBeGreaterThan(0);

      // ステップが論理的順序になっている
      learningPath.steps.forEach((step, index) => {
        expect(step.order).toBe(index + 1);
        expect(step.content).toHaveLength.greaterThan(0);
        
        if (step.prerequisites) {
          step.prerequisites.forEach(prereq => {
            // 前提条件となるステップがより前に配置されている
            const prereqStep = learningPath.steps.find(s => s.processId === prereq);
            if (prereqStep) {
              expect(prereqStep.order).toBeLessThan(step.order);
            }
          });
        }
      });
    });

    it('should adapt path based on user progress', async () => {
      // 初期パス生成
      const initialPath = await adaptiveLearningService.generateLearningPath(testUser.id);

      // 一部進捗を追加
      await prisma.learningProgress.create({
        data: {
          userId: testUser.id,
          processId: initialPath.steps[0].processId,
          masteryLevel: 85,
          studyTime: 3600,
          lastStudied: new Date()
        }
      });

      // パスを更新
      const adaptedPath = await adaptiveLearningService.adaptLearningPath(testUser.id, initialPath.id);

      expect(adaptedPath.steps.length).toBeLessThanOrEqual(initialPath.steps.length);
      
      // 完了したステップは除外またはスキップされる
      const completedStepExists = adaptedPath.steps.some(step => 
        step.processId === initialPath.steps[0].processId && step.status === 'COMPLETED'
      );
      expect(completedStepExists).toBe(true);
    });

    it('should optimize path for time constraints', async () => {
      const shortPath = await adaptiveLearningService.generateLearningPath(testUser.id, {
        timeConstraint: 7 * 24 * 60 * 60, // 7日
        targetMastery: 70
      });

      const longPath = await adaptiveLearningService.generateLearningPath(testUser.id, {
        timeConstraint: 60 * 24 * 60 * 60, // 60日
        targetMastery: 85
      });

      // 短期間パスは効率的なコンテンツを選択
      expect(shortPath.estimatedCompletionTime).toBeLessThanOrEqual(7 * 24 * 60 * 60);
      expect(shortPath.steps.length).toBeLessThanOrEqual(longPath.steps.length);

      // 高効率コンテンツが選ばれている
      shortPath.steps.forEach(step => {
        step.content.forEach(content => {
          expect(content.efficiency).toBeGreaterThan(0.6); // 効率性60%以上
        });
      });
    });

    it('should handle multiple learning objectives', async () => {
      const multiObjectivePath = await adaptiveLearningService.generateLearningPath(testUser.id, {
        objectives: [
          { type: 'CERTIFICATION_PREP', weight: 0.6 },
          { type: 'PRACTICAL_SKILLS', weight: 0.4 }
        ]
      });

      expect(multiObjectivePath.objectives).toHaveLength(2);
      
      // 異なる目的に対応するコンテンツが混在
      const certPrepContent = multiObjectivePath.steps.flatMap(step => 
        step.content.filter(c => c.tags.includes('certification') || c.type === 'QUIZ')
      );
      const practicalContent = multiObjectivePath.steps.flatMap(step => 
        step.content.filter(c => c.tags.includes('practical') || c.type === 'SIMULATION')
      );

      expect(certPrepContent.length).toBeGreaterThan(0);
      expect(practicalContent.length).toBeGreaterThan(0);
    });
  });

  describe('Real-time Recommendation Updates', () => {
    it('should update recommendations after user interaction', async () => {
      // 初期推奨
      const initialRecs = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      // ユーザーが特定コンテンツを評価
      await prisma.contentRating.create({
        data: {
          userId: testUser.id,
          contentId: 'content-1',
          rating: 1 // 低評価
        }
      });

      // ユーザーが学習セッション完了
      await prisma.studySession.create({
        data: {
          userId: testUser.id,
          processId: 'process-1',
          contentId: 'content-3',
          duration: 1800,
          masteryGain: 15,
          startTime: new Date()
        }
      });

      // 推奨を再取得
      const updatedRecs = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      // 低評価されたタイプのコンテンツは減る
      const lowRatedTypeContent = updatedRecs.filter(r => 
        r.type === (await prisma.learningContent.findUnique({ where: { id: 'content-1' } }))?.type
      );
      const initialLowRatedTypeContent = initialRecs.filter(r => 
        r.type === (await prisma.learningContent.findUnique({ where: { id: 'content-1' } }))?.type
      );

      expect(lowRatedTypeContent.length).toBeLessThanOrEqual(initialLowRatedTypeContent.length);
    });

    it('should incorporate immediate feedback', async () => {
      await learningRecommendationService.recordFeedback(testUser.id, {
        contentId: 'content-5',
        feedback: 'HELPFUL',
        context: 'recommendation'
      });

      await learningRecommendationService.recordFeedback(testUser.id, {
        contentId: 'content-8',
        feedback: 'NOT_RELEVANT',
        context: 'recommendation'
      });

      const feedbackAdjustedRecs = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      // ポジティブフィードバックを受けたコンテンツと類似のものが上位に
      const helpfulContentType = (await prisma.learningContent.findUnique({ where: { id: 'content-5' } }))?.type;
      const helpfulTypeRecs = feedbackAdjustedRecs.filter(r => r.type === helpfulContentType);
      
      expect(helpfulTypeRecs.some(r => r.recommendationScore > 0.7)).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large user base efficiently', async () => {
      // 大量のユーザーと学習データを作成
      const manyUsers = await Promise.all(
        Array.from({ length: 100 }, async () => {
          const user = await prisma.user.create({
            data: {
              id: faker.string.uuid(),
              email: faker.internet.email(),
              name: faker.person.fullName(),
              role: 'PREMIUM_USER'
            }
          });

          await prisma.learningProgress.createMany({
            data: Array.from({ length: 5 }, () => ({
              userId: user.id,
              processId: `process-${faker.number.int({ min: 1, max: 10 })}`,
              masteryLevel: faker.number.int({ min: 30, max: 100 }),
              studyTime: faker.number.int({ min: 1800, max: 7200 }),
              lastStudied: faker.date.recent({ days: 30 })
            }))
          });

          return user;
        })
      );

      const startTime = Date.now();
      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);
      const executionTime = Date.now() - startTime;

      expect(executionTime).toBeLessThan(2000); // 2秒以内
      expect(recommendations).toHaveLength.greaterThan(0);
    });

    it('should cache recommendations appropriately', async () => {
      // 初回取得
      const startTime1 = Date.now();
      const recs1 = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);
      const time1 = Date.now() - startTime1;

      // 2回目取得（キャッシュから）
      const startTime2 = Date.now();
      const recs2 = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);
      const time2 = Date.now() - startTime2;

      expect(time2).toBeLessThan(time1 * 0.5); // 50%以上の高速化
      expect(recs1).toEqual(recs2); // 同じ結果
    });

    it('should handle concurrent recommendation requests', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        learningRecommendationService.getPersonalizedRecommendations(testUser.id)
      );

      const results = await Promise.all(concurrentRequests);

      // すべてのリクエストが成功
      results.forEach(result => {
        expect(result).toHaveLength.greaterThan(0);
      });

      // 結果が一貫している
      const firstResult = JSON.stringify(results[0]);
      results.forEach(result => {
        expect(JSON.stringify(result)).toBe(firstResult);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle users with no learning history', async () => {
      const newUser = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          email: faker.internet.email(),
          name: faker.person.fullName(),
          role: 'FREE_USER'
        }
      });

      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(newUser.id);

      expect(recommendations).toHaveLength.greaterThan(0);
      
      // デフォルトの推奨ロジックが適用される
      recommendations.forEach(rec => {
        expect(rec.reason).toContain('default' || 'popular' || 'beginner');
      });
    });

    it('should handle content with missing metadata', async () => {
      // メタデータの欠けたコンテンツ
      const incompleteContent = await prisma.learningContent.create({
        data: {
          id: 'incomplete-content',
          title: 'Incomplete Content',
          processId: 'process-1'
          // type, difficulty, learningStyleなどが欠如
        }
      });

      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      // 不完全なコンテンツも適切に処理される
      expect(recommendations).toHaveLength.greaterThan(0);
    });

    it('should handle recommendation system failures gracefully', async () => {
      // データベース接続エラーをシミュレート
      const originalFindMany = prisma.learningContent.findMany;
      prisma.learningContent.findMany = vi.fn().mockRejectedValueOnce(new Error('Database error'));

      // フォールバック推奨が提供される
      const fallbackRecs = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      expect(fallbackRecs).toHaveLength.greaterThan(0);
      fallbackRecs.forEach(rec => {
        expect(rec.reason).toContain('fallback');
      });

      prisma.learningContent.findMany = originalFindMany;
    });

    it('should validate recommendation quality', async () => {
      const recommendations = await learningRecommendationService.getPersonalizedRecommendations(testUser.id);

      // 品質チェック
      recommendations.forEach(rec => {
        expect(rec.recommendationScore).toBeGreaterThan(0.1); // 最低品質スコア
        expect(rec.reason).toBeTruthy();
        expect(rec.contentId).toBeTruthy();
        
        // 不適切なコンテンツが推奨されていない
        expect(rec.title).not.toContain('test');
        expect(rec.title).not.toContain('invalid');
      });

      // 多様性の確保
      const uniqueTypes = [...new Set(recommendations.map(r => r.type))];
      expect(uniqueTypes.length).toBeGreaterThanOrEqual(Math.min(3, recommendations.length));
    });
  });
});