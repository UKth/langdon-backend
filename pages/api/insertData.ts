import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages, VERIFICATION_TOKEN_EXPIRATION } from "@constants";
import jwt from "jsonwebtoken";

import { data } from "../../courseData/data_parsed";

// mail.setApiKey(process.env.SENDGRID_KEY!);
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const college = await client.college.findUnique({
    where: {
      mailFooter: "wisc.edu",
    },
  });
  if (!college) {
    return res.status(400).json({ ok: false, error: "error1" });
  }

  const dataNum = data.length;
  for (let i = 3430; i < dataNum; i++) {
    console.log("i:", i, "/ " + dataNum + " ...");

    const courseData = data[i];
    // console.log(courseData);

    const newCourse = await client.course.create({
      data: {
        college: {
          connect: {
            id: college?.id,
          },
        },
        courseId: courseData.courseId,
        termCode: +courseData.termCode,
        subjectCode: +courseData.subjectCode,
        courseDesignation: courseData.courseDesignationRaw,
        courseDesignationCompressed: courseData.courseDesignationRaw.replace(
          / /g,
          ""
        ),
        fullCourseDesignation: courseData.fullCourseDesignationRaw,
        fullCourseDesignationCompressed:
          courseData.fullCourseDesignationRaw.replace(/ /g, ""),
        minimumCredits: courseData.minimumCredits,
        maximumCredits: courseData.maximumCredits,
        title: courseData.title,
      },
    });

    for (let j = 0; j < courseData.classes.length; j++) {
      // console.log(" j:", j, "/ " + courseData.classes.length + " ...");
      const newClass = await client.class.create({
        data: {
          course: {
            connect: {
              id: newCourse.id,
            },
          },
        },
      });

      const sections = courseData.classes[j].sections;

      for (let k = 0; k < sections.length; k++) {
        // console.log("  k:", k, "/ " + sections.length + " ...");
        const sectionData = sections[k];
        const newSection = await client.section.create({
          data: {
            class: {
              connect: {
                id: newClass.id,
              },
            },
            type: sectionData.type,
            sectionNumber: sectionData.sectionNumber,
            ...(sectionData.instructor &&
            sectionData.instructor.personAttributes.netid
              ? {
                  instructor: {
                    connectOrCreate: {
                      where: {
                        netid: sectionData.instructor.personAttributes.netid,
                      },
                      create: {
                        netid: sectionData.instructor.personAttributes.netid,
                        emplid: sectionData.instructor.personAttributes.emplid,
                        pvi: sectionData.instructor.personAttributes.pvi,
                        firstName:
                          sectionData.instructor.personAttributes.name.first,
                        middleName:
                          sectionData.instructor.personAttributes.name.middle,
                        lastName:
                          sectionData.instructor.personAttributes.name.last,
                        email: sectionData.instructor.personAttributes.email,
                      },
                    },
                  },
                }
              : {}),
          },
        });
        for (let l = 0; l < sectionData.classMeetings.length; l++) {
          // console.log(
          //   "   l:",
          //   l,
          //   "/ " + sectionData.classMeetings.length + " ..."
          // );
          const meetingData = sectionData.classMeetings[l];
          const newMeeting = await client.classMeeting.create({
            data: {
              section: {
                connect: {
                  id: newSection.id,
                },
              },
              meetingOrExamNumber: meetingData.meetingOrExamNumber,
              meetingType: meetingData.meetingType,
              meetingTimeStart: meetingData.meetingTimeStart,
              meetingTimeEnd: meetingData.meetingTimeEnd,
              meetingDays: meetingData.meetingDays,
              ...(meetingData.building
                ? {
                    building: {
                      connectOrCreate: {
                        where: {
                          buildingCode: meetingData.building?.buildingCode,
                        },
                        create: {
                          buildingCode: meetingData.building.buildingCode,
                          buildingName: meetingData.building.buildingName,
                          streetAddress: meetingData.building.streetAddress,
                          latitude: meetingData.building.latitude,
                          longitude: meetingData.building.longitude,
                        },
                      },
                    },
                  }
                : {}),
              room: meetingData.room,
              examDate: meetingData.examDate,
            },
          });
        }
      }
    }

    if (!newCourse) {
      return res.status(400).json({ ok: false, error: "error2" });
    }
  }
  return res.send({ ok: true });
}

export default handler;
