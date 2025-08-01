const request = require('supertest');
const express = require('express');
const Plan = require('../models/Plan');
const planController = require('../controllers/planController');

// Mock the Plan model
jest.mock('../models/Plan');

// Create Express app for testing
const app = express();
app.use(express.json());

// Define routes
app.post('/plans', planController.createPlan);
app.get('/plans', planController.getAllPlans);
app.get('/plans/:id', planController.getPlanById);
app.put('/plans/:id', planController.updatePlan);
app.delete('/plans/:id', planController.deletePlan);

// Mock data
const mockPlan = {
  _id: '64f8a1b2c3d4e5f6789abcde',
  name: 'Basic Plan',
  price: 29.99,
  description: 'A basic subscription plan'
};

const mockPlans = [
  {
    _id: '64f8a1b2c3d4e5f6789abcde',
    name: 'Basic Plan',
    price: 29.99,
    description: 'A basic subscription plan'
  },
  {
    _id: '64f8a1b2c3d4e5f6789abcdf',
    name: 'Premium Plan',
    price: 59.99,
    description: 'A premium subscription plan'
  }
];

describe('Plan Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /plans - createPlan', () => {
    it('should create a new plan successfully', async () => {
      const newPlanData = {
        name: 'Pro Plan',
        price: 99.99,
        description: 'A professional subscription plan'
      };

      Plan.findOne.mockResolvedValue(null); // No existing plan
      Plan.create.mockResolvedValue({ ...newPlanData, _id: '64f8a1b2c3d4e5f6789abce0' });

      const response = await request(app)
        .post('/plans')
        .send(newPlanData)
        .expect(201);

      expect(response.body).toEqual({
        ...newPlanData,
        _id: '64f8a1b2c3d4e5f6789abce0'
      });
      expect(Plan.findOne).toHaveBeenCalledWith({ name: newPlanData.name });
      expect(Plan.create).toHaveBeenCalledWith(newPlanData);
    });

    it('should return 400 if plan already exists', async () => {
      const existingPlanData = {
        name: 'Basic Plan',
        price: 29.99,
        description: 'A basic subscription plan'
      };

      Plan.findOne.mockResolvedValue(mockPlan); // Plan exists

      const response = await request(app)
        .post('/plans')
        .send(existingPlanData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Plan already exists'
      });
      expect(Plan.findOne).toHaveBeenCalledWith({ name: existingPlanData.name });
      expect(Plan.create).not.toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      const newPlanData = {
        name: 'Error Plan',
        price: 19.99,
        description: 'This will cause an error'
      };

      Plan.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/plans')
        .send(newPlanData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });

  describe('GET /plans - getAllPlans', () => {
    it('should fetch all plans successfully', async () => {
      Plan.find.mockResolvedValue(mockPlans);

      const response = await request(app)
        .get('/plans')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Plans fetched successfully',
        data: mockPlans
      });
      expect(Plan.find).toHaveBeenCalled();
    });

    it('should return empty array when no plans exist', async () => {
      Plan.find.mockResolvedValue([]);

      const response = await request(app)
        .get('/plans')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Plans fetched successfully',
        data: []
      });
    });

    it('should return 500 on server error', async () => {
      Plan.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/plans')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });

  describe('GET /plans/:id - getPlanById', () => {
    it('should fetch a plan by ID successfully', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      Plan.findById.mockResolvedValue(mockPlan);

      const response = await request(app)
        .get(`/plans/${planId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Plan fetched successfully',
        data: mockPlan
      });
      expect(Plan.findById).toHaveBeenCalledWith(planId);
    });

    it('should return 404 if plan not found', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      Plan.findById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/plans/${planId}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Plan not found'
      });
      expect(Plan.findById).toHaveBeenCalledWith(planId);
    });

    it('should return 500 on server error', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      Plan.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/plans/${planId}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });

  describe('PUT /plans/:id - updatePlan', () => {
    it('should update a plan successfully', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      const updateData = {
        name: 'Updated Basic Plan',
        price: 39.99,
        description: 'An updated basic subscription plan'
      };
      const updatedPlan = { ...mockPlan, ...updateData };

      Plan.findByIdAndUpdate.mockResolvedValue(updatedPlan);

      const response = await request(app)
        .put(`/plans/${planId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Plan updated successfully',
        data: updatedPlan
      });
      expect(Plan.findByIdAndUpdate).toHaveBeenCalledWith(
        planId,
        updateData,
        { new: true }
      );
    });

    it('should return 404 if plan not found', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      const updateData = {
        name: 'Updated Plan',
        price: 49.99,
        description: 'Updated description'
      };

      Plan.findByIdAndUpdate.mockResolvedValue(null);

      const response = await request(app)
        .put(`/plans/${planId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Plan not found'
      });
    });

    it('should return 500 on server error', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      const updateData = {
        name: 'Error Plan',
        price: 49.99,
        description: 'This will cause an error'
      };

      Plan.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/plans/${planId}`)
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });

  describe('DELETE /plans/:id - deletePlan', () => {
    it('should delete a plan successfully', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      Plan.findByIdAndDelete.mockResolvedValue(mockPlan);

      const response = await request(app)
        .delete(`/plans/${planId}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Plan deleted'
      });
      expect(Plan.findByIdAndDelete).toHaveBeenCalledWith(planId);
    });

    it('should return 404 if plan not found', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      Plan.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/plans/${planId}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Plan not found'
      });
    });

    it('should return 500 on server error', async () => {
      const planId = '64f8a1b2c3d4e5f6789abcde';
      Plan.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/plans/${planId}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });
});

// Additional integration tests
describe('Plan Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete CRUD operations flow', async () => {
    const newPlan = {
      name: 'Integration Test Plan',
      price: 79.99,
      description: 'A plan for integration testing'
    };

    // Create
    Plan.findOne.mockResolvedValue(null);
    Plan.create.mockResolvedValue({ ...newPlan, _id: 'integration-test-id' });

    const createResponse = await request(app)
      .post('/plans')
      .send(newPlan)
      .expect(201);

    expect(createResponse.body._id).toBe('integration-test-id');

    // Read
    Plan.findById.mockResolvedValue(createResponse.body);

    const getResponse = await request(app)
      .get('/plans/integration-test-id')
      .expect(200);

    expect(getResponse.body.data.name).toBe(newPlan.name);

    // Update
    const updateData = { ...newPlan, price: 89.99 };
    Plan.findByIdAndUpdate.mockResolvedValue({ ...createResponse.body, ...updateData });

    const updateResponse = await request(app)
      .put('/plans/integration-test-id')
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.data.price).toBe(89.99);

    // Delete
    Plan.findByIdAndDelete.mockResolvedValue(createResponse.body);

    await request(app)
      .delete('/plans/integration-test-id')
      .expect(200);
  });
});