const bcrypt = require("bcrypt");
const userModel = require("./../models/user.model");


// ////////////////////////////////////////////  USER - CONTROLLERS  ///////////////////////////////////////////


exports.updateUser = async (req, res, next) => {

  try{

    const { name, username, email } = req.body;

    const id = String(req.user._id);

    await userModel.updateValidation({...req.body , id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const userExists = await userModel.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: id }
    });

    if (userExists) {
      return res.status(409).json({
        message: "username or email is duplicated.",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        name,
        username,
        email,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "user updated successfully !", data: user});

  }catch(error){
    next(error);
  }

};


exports.changeUserPassword = async (req, res, next) => {

  try{

    const { currentPassword, password, confirmPassword } = req.body;
    
    const id = String(req.user._id);

    const currentUser = await userModel.findById(id);

    if (!currentUser) {
      return res.status(401).json("There is no user with this id !");
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, String(currentUser.password));

    if (!isCurrentPasswordCorrect) {
      // return res.status(401).json({ message: "current password is not correct !" });
      return res.status(452).json({ message: "current password is not correct !" });
    }

    await userModel.changePasswordValidation_ByUser({...req.body , id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "password changed successfully !", data: user});

  }catch(error){
    next(error);
  }
}


// ////////////////////////////////////////////  ADMIN - CONTROLLERS  ///////////////////////////////////////////


exports.getAllUsersByAdmin = async (req, res, next) => {
  try{
    const users = await userModel.find();
    if (!users) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "users get successfully !", data: users});
    
  }catch(error){
    next(error);
  }
};


exports.updateUserByAdmin = async (req, res, next) => {

  try{

    const { name, username, email } = req.body;

    const { id } = req.params;

    await userModel.updateValidation({...req.body , id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const userExists = await userModel.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: id }
    });

    if (userExists) {
      return res.status(409).json({
        message: "username or email is duplicated.",
      });
    }

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        name,
        username,
        email,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "user updated successfully !", data: user});

  }catch(error){
    next(error);
  }

};


exports.createUserByAdmin = async (req, res, next) => {

  try {

    const { name , username, email, password, confirmPassword } = req.body;

    await userModel.registerValidation(req.body).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const isUserExists = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserExists) {
      return res.status(409).json({
        message: "username or email is duplicated.",
      });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

    const user = await userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: "USER",
    });

    if (!user) {
      return res.status(404).json("user not found !");
    }

    const userObject = user.toObject();

    Reflect.deleteProperty(userObject, "password");

    return res.status(201).json({status: 201, message: "user Created successfully !", data: userObject});

  } catch (error) {
    next(error);
  }
};


exports.changeUserRoleByAdmin = async (req, res, next) => {

  try{

    const { role } = req.body;

    const { id } = req.params;

    await userModel.changeRoleValidation({...req.body , id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        role,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "role changed successfully !", data: user});

  }catch(error){
    next(error);
  }
}


exports.changeUserPasswordByAdmin = async (req, res, next) => {

  try{

    const { password, confirmPassword } = req.body;

    const { id } = req.params;

    await userModel.changePasswordValidation({...req.body , id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "password changed successfully !", data: user});

  }catch(error){
    next(error);
  }
}


exports.removeUserByAdmin = async (req, res, next) => {

  try{

    const { id } = req.params;

    await userModel.removeValidation({id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const user = await userModel.findByIdAndDelete(
      id,
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "user deleted successfully !", data: user});

  }catch(error){
    next(error);
  }

};


exports.banUserByAdmin = async (req, res, next) => {

  try{

    const { id } = req.params;

    await userModel.banValidation({id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        isBan: true,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "user banned successfully !", data: user});

  }catch(error){
    next(error);
  }

};


exports.unbanUserByAdmin = async (req, res, next) => {

  try{

    const { id } = req.params;

    await userModel.unbanValidation({id}).catch((err) => {
      err.statusCode = 400;
      throw err;
    });

    const user = await userModel.findByIdAndUpdate(
      id,
      {
        isBan: false,
      }
    );

    if (!user) {
      return res.status(404).json("user not found !");
    }

    return res.status(200).json({status: 200, message: "user unbanned successfully !", data: user});

  }catch(error){
    next(error);
  }

};
