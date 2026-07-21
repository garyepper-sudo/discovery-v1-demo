import {
  NextResponse,
} from "next/server";

import {
  runOrganizationInvestigation,
} from "../../../engine/v3/investigation/runOrganizationInvestigation";

import {
  resolveOrganizationId,
} from "../../../engine/v3/runtime";

export async function POST(
  req: Request,
) {
  try {
    const body =
      await req.json();

    const organizationId =
      resolveOrganizationId(
        body.organizationId,
      );

    const investigation =
      runOrganizationInvestigation({
        organizationId,

        company:
          body.company ||
          "",

        website:
          body.website ||
          "",

        industry:
          body.industry ||
          "",

        question:
          body.question ||
          "",

        context:
          body.messyInput ||
          body.context ||
          "",
      });

    return NextResponse.json({
      executiveProjection:
        investigation
          .executiveProjection,
    });
  } catch (
    error
  ) {
    console.error(
      "Discovery investigation failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof
            Error
            ? error.message
            : "Discovery investigation failed.",
      },
      {
        status:
          500,
      },
    );
  }
}
