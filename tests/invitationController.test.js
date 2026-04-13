jest.mock('../models/Invitation', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn()
}));

jest.mock('../models/Group', () => ({
  findByPk: jest.fn()
}));

jest.mock('../models/GroupMember', () => ({
  findOne: jest.fn(),
  findOrCreate: jest.fn()
}));

jest.mock('../models/user', () => ({
  findByPk: jest.fn(),
  findOne: jest.fn()
}));

const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const User = require('../models/user');
const { inviteMember, respondToInvite } = require('../controllers/invitationController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('invitationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('inviteMember returns 404 when group missing', async () => {
    Group.findByPk.mockResolvedValue(null);
    const req = { params: { groupId: 1 }, body: { email: 'target@example.com' }, user: { id: 1 } };
    const res = buildRes();

    await inviteMember(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Group not found' });
  });

  test('inviteMember accepts email payload alias', async () => {
    Group.findByPk.mockResolvedValue({ id: 2, userId: 1 });
    User.findOne.mockResolvedValue({ id: 9 });
    GroupMember.findOne.mockResolvedValue(null);
    Invitation.create.mockResolvedValue({ id: 5, groupId: 2, inviteeId: 9, inviterId: 1 });

    const req = { params: { groupId: 2 }, body: { email: 'target@example.com' }, user: { id: 1 } };
    const res = buildRes();

    await inviteMember(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'target@example.com' } });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }));
  });

  test('respondToInvite rejects invalid response', async () => {
    Invitation.findByPk.mockResolvedValue({ inviteeId: 1 });
    const req = { params: { invitationId: 3 }, body: { response: 'maybe' }, user: { id: 1 } };
    const res = buildRes();

    await respondToInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid response' });
  });
});
