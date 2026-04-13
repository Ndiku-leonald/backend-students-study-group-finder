process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-1234567890';

jest.mock('../models/Group', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/GroupMember', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
}));

jest.mock('../models/user', () => ({
  findByPk: jest.fn()
}));

const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { createGroup, leaveGroup, searchGroups } = require('../controllers/groupController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('groupController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createGroup returns 400 for missing name/course', async () => {
    const req = { body: { name: '' }, user: { id: 1 } };
    const res = buildRes();

    await createGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name and course are required' });
  });

  test('leaveGroup blocks leader from leaving own group', async () => {
    Group.findByPk.mockResolvedValue({ id: 10, userId: 1 });
    const req = { params: { groupId: 10 }, user: { id: 1 } };
    const res = buildRes();

    await leaveGroup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Group leaders cannot leave their own group' });
  });

  test('searchGroups executes with filter inputs', async () => {
    Group.findAll.mockResolvedValue([]);
    const req = { query: { title: 'Algo', course: 'DSA' } };
    const res = buildRes();

    await searchGroups(req, res);

    expect(Group.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([]);
  });
});
