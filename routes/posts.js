const router = require('express').Router();
const PostModel = require('../models/PostModel');

// TODO: 포스트 전체 조회
router.get('/', (req, res) => {
    PostModel.find({ isDeleted: false }).populate('createdBy', 'userId nickname')
    .then(posts => {
        res.status(200).json({
            success: true,
            posts,
        });
    }).catch(err => {
        console.error(err);
    })
});

// TODO: 포스트 1개 조회
router.get('/:number', async (req, res) => {
    
    const { number } = req.params;
    const result = await PostModel.findOne({ number, isDeleted: false })
        .populate({ path: 'createdBy', select: 'userId nickname' })
        .populate({ path: 'comments.createdBy', select: 'nickname'})

    result.comments.pop
    console.log(result);
      
    
    res.status(200).send({
        success: true,
        message: '포스트 조회 성공',
        post: result,
    });    
});

// TODO: 포스트 생성
router.post('/', (req, res) => {
    const { title, contents } = req.body;
    const user = req.user._id;
    console.log(user);
    
    const newPost = new PostModel({
        title,
        contents,
        createdBy: user,
    });
    newPost.save((err, saved) => {
        if(err){
            console.error(err);
            res.status(409).send(err);
        } else{
            console.log(saved);
            res.send(saved);
        }
    })
});

// TODO: 포스트 수정
router.put('/:number', async (req, res) => {
    // 글쓴이가 맞는지 확인해야한다.
    const { number } = req.params;
    await PostModel.findOneAndUpdate({})
    res.status(200).send({
        success: true,
    });
});

// TODO: 포스트 삭제
router.delete('/:number', async (req, res) => {
    const { number } = req.params;
    // 요청 날린 사용자와 글쓴이가 같은지 확인해야한다.
    await PostModel.updateOne({ number }, { isDeleted: true })
    res.status(200).send('Delete Success');
});


router.put('/:number/recommend', async (req, res) => {
    const { number, userId } = req.body;
    const postData = await PostModel.findOne({ number });
    
    const findData = postData.recommend.find(v => {
        return v.recommendBy === userId;
    })
    if(!findData){
        // 추천을 처음 눌렀을때
        const recommend = {
            recommendBy: userId,
            value: true,
        }
        await PostModel.updateOne({number}, {$push: {recommend}})
    } else{
        // 추천 제거
        await PostModel.updateOne({number}, {$pull: {
            recommend: {recommendBy: userId}
        }})
    }
    res.status(200).send('success');
    
});

// 댓글
router.post('/:number/comments', async (req, res) => {
    const { number, contents } = req.body;
    // await PostModel.findOneAndUpdate({number}, 
    //     {$push: {comments: {contents, commentedBy}}}
    //     )
    const user = req.user;
    const comments = {
        contents,
        createdBy: user,
    };
    // const postData = await PostModel.findOne({number});
    try {
        await PostModel.updateOne({ number }, { $push: { comments }})
    } catch (err) {
        console.error(err);
    }
    res.status(200).send('Success');
})

module.exports = router;