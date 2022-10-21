import { EXAMDATE_OFFSET } from "@constants";
import { getData } from "@libs/client/util";
import {
  Building,
  Class,
  ClassMeeting,
  Course,
  Instructor,
  Section,
} from "@prisma/client";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Home.module.css";

type FullSectionData = Section & {
  classMeetings: (ClassMeeting & { building: Building })[];
  instructor: Instructor;
};

type ClassWithSections = Class & { sections: Section[] };
type CourseWithClasses = Course & { classes: ClassWithSections[] };

const Home: NextPage = () => {
  const [keyword, setKeyword] = useState("");
  const [searchedData, setSearchedData] = useState<CourseWithClasses[]>();
  const [classData, setClassData] = useState<
    Class & { sections: FullSectionData[] }
  >();
  const [selectedCourse, setSelectedCourse] = useState<Course>();
  const getCourseData = async () => {
    setSelectedCourse(undefined);
    console.log("hello");
    const data = await getData("/api/course/getCourse/" + keyword);
    console.log(data, keyword);
    if (data?.ok) {
      setSearchedData(data?.courseData);
    }
  };
  const getClassData = async (id: number) => {
    console.log("world");
    const data = await getData("/api/class/getClass/" + id);
    console.log(data, id);
    if (data?.ok) {
      setClassData(data?.classData);
    }
  };
  return (
    <div className="flex flex-row">
      <div className="flex-1">
        <div className="p-1">
          <p>enter keyword</p>
          <input
            className="border p-1 rounded"
            onChange={(e) => setKeyword(e.target.value.replace(/ /g, ""))}
          />
          <button
            className="bg-blue-200 p-1 hover:scale-95 rounded"
            onClick={getCourseData}
          >
            search
          </button>
        </div>
        {searchedData ? (
          <div className="border rounded m-2 p-2">
            {searchedData.map((course) => (
              <div key={course.id}>
                <button
                  className="bg-blue-200 mb-2 rounded hover:scale-95 w-full text-sm md:text-lg"
                  onClick={() => setSelectedCourse(course)}
                >
                  <p>{course.title}</p>
                  <p>{course.courseDesignation}</p>
                  <p>{course.fullCourseDesignation}</p>
                </button>
                {selectedCourse?.id === course.id ? (
                  <div className="w-2/5">
                    {course.classes.map((cls) => (
                      <button
                        key={cls.id}
                        className="border rounded p-1 m-1 hover:scale-95"
                        onClick={() => getClassData(cls.id)}
                      >
                        {cls.sections.map((section) => (
                          <p key={section.id}>
                            {section.type} {section.sectionNumber}
                          </p>
                        ))}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {classData ? (
        <div className="flex-1 py-4">
          {classData.sections.map((section) => (
            <div key={section.id}>
              <p>
                {section.type} {section.sectionNumber}
              </p>
              <div className="border rounded p-2">
                <p>meetings</p>
                {section.classMeetings.map((meeting) => {
                  const isExam = meeting.meetingType === "EXAM";
                  const meetingTimeStart = new Date(
                    meeting.meetingTimeStart ? meeting.meetingTimeStart : 0
                  );
                  const meetingTimeEnd = new Date(
                    meeting.meetingTimeEnd ? meeting.meetingTimeEnd : 0
                  );
                  return (
                    <div key={meeting.id} className="border m-1">
                      <p>{meeting.meetingType}</p>
                      {!isExam ? <p>{meeting.meetingDays}</p> : null}
                      {meeting.examDate ? (
                        <p>
                          {new Date(
                            meeting.examDate + EXAMDATE_OFFSET || 0
                          ).toDateString()}
                        </p>
                      ) : null}
                      {meetingTimeStart.valueOf() &&
                      meetingTimeEnd.valueOf() ? (
                        <p>
                          {meetingTimeStart.getHours() +
                            ":" +
                            meetingTimeStart.getMinutes() +
                            " ~ " +
                            meetingTimeEnd.getHours() +
                            ":" +
                            meetingTimeEnd.getMinutes()}
                        </p>
                      ) : null}

                      {meeting.building ? (
                        <p>{meeting.building.buildingName}</p>
                      ) : null}
                    </div>
                  );
                })}
                {section.instructor ? (
                  <div>
                    <p>instructor:</p>
                    <p>
                      {section.instructor.firstName +
                        " " +
                        section.instructor.lastName}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Home;
