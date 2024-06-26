const bcrypt = require('bcryptjs')
const db = require('../../models')
const { User, Restaurant, Comment, Favorite, Like, Followship } = db
const { localFileHandler } = require('../../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.passwordCheck !== req.body.password) throw new Error('Password does not match')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('User already exists')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_msg', 'You have successfully signed up')
        res.redirect('/signin')
      })
      .catch(next)
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_msg', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => {
        if (!user) throw new Error('User not found')
        // 測試未設定passport故暫時隱藏以下代碼
        // if (user.id !== req.user.id) {
        //   req.flash('error_messages', '權限不足')
        //   return res.redirect('back')
        // }
        user = user.toJSON()

        const uniqueRestaurantIds = new Set()
        const uniqueComments = user.Comments?.filter(comment => {
          if (uniqueRestaurantIds.has(comment.restaurantId)) {
            return false // 如果已經有這個 restaurantId，則過濾掉這個評論
          } else {
            uniqueRestaurantIds.add(comment.restaurantId) // 否則加入 Set 並保留評論
            return true
          }
        })

        user.Comments = uniqueComments
        user.commentCount = user.Comments ? user.Comments.length : 0

        const isFollowed = req.user?.Followings.some(f => f.id === user.id)
        const isNotSelf = req.user?.id !== user.id
        // 確認非本人才能追蹤/取消追蹤該對象(出現追蹤/取消追蹤按鈕)
        const isSelf = req.user?.id === user.id
        // 確認為本人才能編輯(出現編輯按鈕)
        return res.render('users/profile', { user, isFollowed, isNotSelf, isSelf })
      })
      .catch(next)
  },
  editUser: (req, res, next) => {
    return User.findByPk(req.params.id, { raw: true })
      .then(user => {
        if (!user) throw new Error('User not found')
        // 測試未設定passport故暫時隱藏以下代碼
        // if (user.id !== req.user.id) {
        //   req.flash('error_messages', '權限不足')
        //   return res.redirect('back')
        // }
        // 測試未設定req.user 因此做以下設定
        if (req.user) {
          if (user.id !== req.user.id) {
            req.flash('error_messages', '權限不足')
            return res.redirect('back')
          }
        }
        return res.render('users/edit', { user })
      })
      .catch(next)
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('User name is required!')
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User didn't exist!")
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(user => {
        req.flash('success_messages', '使用者資料編輯成功')
        res.redirect(`/users/${user.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (like) throw new Error('You have liked this restaurant!')

        return Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't liked this restaurant")

        return like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        return res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You are already following this user!')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}
module.exports = userController
