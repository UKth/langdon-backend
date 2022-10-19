import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  errorMessages,
  JWT_TOKEN_EXPIRATION,
  VERIFICATION_TOKEN_EXPIRATION,
} from "@constants";
import jwt from "jsonwebtoken";

import { data } from "../../courseData/data_parsed";

// mail.setApiKey(process.env.SENDGRID_KEY!);
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { email, token } = req.body;

  const college = await client.college.findUnique({
    where: {
      mailFooter: "wisc.edu",
    },
  });
  if (!college) {
    return res.status(400).json({ ok: false, error: "error1" });
  }

  for (var i = 0; i < 10; i++) {
    const courseData = data[i];
    const course = await client.course.create({
      data: {
        college: {
          connect: {
            id: college?.id,
          },
        },
        termCode: +courseData.termCode,
        subjectCode: +courseData.subject.subjectCode,
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
        classes: {
          createMany: {
            data: courseData.classes.map((cls) => ({
              sections: {
                createMany: {
                  data: cls.map((section) => ({
                    type: section.type,
                    sectionNumber: section.sectionNumber,
                    instructor: {
                      connectOrCreate: {
                        where: {
                          netid: section.instructor.personAttributes.netid,
                        },
                        create: {
                          netid: section.instructor.personAttributes.netid,
                          emplid: section.instructor.personAttributes.emplid,
                          pvi: section.instructor.personAttributes.pvi,
                          firstName:
                            section.instructor.personAttributes.name.first,
                          middleName:
                            section.instructor.personAttributes.name.middle,
                          lastName:
                            section.instructor.personAttributes.name.last,
                          email: section.instructor.personAttributes.email,
                        },
                      },
                    },
                    classMeetings: {
                      createMany: {
                        data: section.classMeetings.map((meeting) => ({
                          meetingOrExamNumber: meeting.meetingOrExamNumber,
                          meetingType: meeting.meetingType,
                          meetingTimeStart: meeting.meetingTimeStart,
                          meetingTimeEnd: meeting.meetingTimeEnd,
                          meetingDays: meeting.meetingDays,
                          ...(meeting.building
                            ? {
                                building: {
                                  connectOrCreate: {
                                    where: {
                                      buildingCode:
                                        meeting.building?.buildingCode,
                                    },
                                    create: {
                                      buildingCode:
                                        meeting.building.buildingCode,
                                      buildingName:
                                        meeting.building.buildingName,
                                      streetAddress:
                                        meeting.building.streetAddress,
                                      latitude: meeting.building.latitude,
                                      longitude: meeting.building.longitude,
                                    },
                                  },
                                },
                              }
                            : {}),
                          room: meeting.room,
                          examDate: meeting.examDate,
                        })),
                      },
                    },
                  })),
                },
              },
            })),
          },
        },
      },
    });
  }
}

export default handler;
