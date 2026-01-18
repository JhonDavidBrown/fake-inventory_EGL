
const getAllUsers = async (req, res) => {
  try {
    
    const { userId } = req.auth; 

    res.status(200).json({
      message: 'Ruta de usuarios protegida funcionando correctamente.',
      authenticatedUserId: userId,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
};