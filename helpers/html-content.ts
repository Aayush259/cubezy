export const footer = `
<tr>
    <td>
        <div style="background-color: #1d4fd843; padding: 8px 20px;">
            <p style="font-size: 12px; line-height: 18px;">
                You have received this email because you are registered at Cubezy, to ensure the implementation of our Terms of Service and (or) for other legitimate matters.
            </p>

            <a href="" style="font-size: 12px; line-height: 18px; color: #FFFFFF;">
                Privacy Policy
            </a>

            <p style="font-size: 12px; line-height: 18px;">
                &copy; 2025 Cubezy | All rights reserved.
            </p>
        </div>
    </td>
</tr>
`

export const htmlContent = ({ title, content }: { title: string, content: string }) => {

    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- enable media queries for windows phone 8 -->
        <meta name="format-detection" content="telephone=no"> <!-- disable auto telephone linking in iOS -->
        <meta name="format-detection" content="date=no"> <!-- disable auto date linking in iOS -->
        <meta name="format-detection" content="address=no"> <!-- disable auto address linking in iOS -->
        <meta name="format-detection" content="email=no"> <!-- disable auto email linking in iOS -->
        <meta name="color-scheme" content="only">
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
            href="https://fonts.googleapis.com/css2?family=Arima:wght@100..700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
            rel="stylesheet">
    </head>

    <body
        style="padding: 0; margin: 0; box-sizing: border-box; font-family: Montserrat, sans-serif; font-style: normal; background-color: #1E293B;">
        ${content}
    </body>

    </html>
    `
}

export const otpMail = (otp: string) => {

    return htmlContent({
        title: "Cubezy - OTP Verification",
        content: `
        <table
            style="width: 100%; max-width: 680px; margin: auto; background-color: #0A0A0A; color: #FFFFFF; padding-top: 20px;">
            <tr>
                <td style="padding: 0 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <!-- Logo image cell -->
                            <td valign="middle" style="padding-right: 10px;">
                                <img src="./logo.png" alt="Cubezy Logo"
                                    style="height: 50px; width: auto; display: block;">
                            </td>
                            <!-- Text cell -->
                            <td valign="middle" style="font-weight: 500; font-size: 24px; color: #FFFFFF;">
                                CUBEZY
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr>
                <td style="padding: 0 20px;">
                    <p style="font-size: 14px; line-height: 24px;">
                        Here is your verification code:
                    </p>
                </td>
            </tr>

            <tr>
                <td style="padding: 0 20px;">
                    <div style="margin: 10px; padding: 5px 20px; font-weight: 500; background-color: #1d4fd843;">
                        <p>${otp}</p>
                    </div>
                </td>
            </tr>

            <tr>
                <td style="padding: 0 20px;">
                    <p style="font-size: 14px; line-height: 24px;">
                        Please make sure you never share this code with anyone.
                    </p>

                    <p style="font-size: 14px; line-height: 24px;">
                        <span style="font-weight: 500;">Note:</span> The code will expire in 10 minutes.
                    </p>
                </td>
            </tr>
            ${footer}
        </table>
        `
    })
}