import { Schema, model} from "mongoose";


const courseSchema = new Schema(
  {
    title: {
      type: String,
      required:[true,'Tile is required!!!'],
      minLength:[8,'Title must be atleast 8 charactor'],
      maxLength:[59,'Title must be less than 59 charactor']
    },
    description: {
      type: String,
      required:[true,'Description is required!!!'],
      minLength:[8,'Description must be atleast 8 charactor'],
      maxLength:[200,'Description must be less than 200 charactor']
    },
    category: {
      type: String,
      required:[true,'Category is required!!!'],

    },
    thumbnail: {
      public_id: {
        type: String,
        // required:true
      },
      secure_url: {
        type: String,
        // required:true
      },
    },
    lectures: [
      {
        title: String,
        description: String,
        lecture: {
          public_id: {
            type: String,
            required:true
          },
          secure_url: {
            type: String,
            required:true
          },
        },
      },
    ],
    numberOfLecture:{
        type:Number,
        default:0
    },
    createdBy:{
        type:String,
        required: [true, 'Course instructor name is required'],
    }

  },
  { timestamps: true }
);

const Course = model("Course", courseSchema); // yhi par glti ki thi 

export default Course;
