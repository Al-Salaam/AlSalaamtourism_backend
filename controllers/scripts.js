const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');

const jsonFileName = 'tourism.activities.json';
const jsonFilePath = path.join(__dirname, '..', 'utils', jsonFileName);

exports.updateAndRetrieveSanitizedActivities = (req, res, next) => {
    // Read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (readErr, data) => {
        if (readErr) {
            console.error('Error reading JSON file:', readErr);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        try {
            const activities = JSON.parse(data);

            // Remove "_id", "createdAt", and "updatedAt" from each object
            const sanitizedActivities = activities.map(({ _id, createdAt, updatedAt, ...rest }) => rest);

            // Convert the sanitized activities back to JSON
            const modifiedJson = JSON.stringify(sanitizedActivities, null, 2);

            // Write the modified JSON back to the file
            fs.writeFile(jsonFilePath, modifiedJson, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing modified JSON to file:', writeErr);
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
                }

                res.status(200).json({
                    success: true,
                    message: 'Successfully updated and retrieved sanitized activities',
                    data: sanitizedActivities
                });
            });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });
};


exports.updateActivitiesWithSlugs = (req, res, next) => {
    // Read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (readErr, data) => {
        if (readErr) {
            console.error('Error reading JSON file:', readErr);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        try {
            const activities = JSON.parse(data);

            // Add "slug" field based on "name" field for each object
            const activitiesWithSlug = activities.map((activity) => {
                return {
                    ...activity,
                    slug: slugify(activity.name, { lower: true })
                };
            });

            // Convert the updated activities back to JSON
            const modifiedJson = JSON.stringify(activitiesWithSlug, null, 2);

            // Write the modified JSON back to the file
            fs.writeFile(jsonFilePath, modifiedJson, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing modified JSON to file:', writeErr);
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
                }

                res.status(200).json({
                    success: true,
                    message: 'Successfully updated JSON file with slugs',
                    data: activitiesWithSlug
                });
            });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });
};

function slugify(text, options) {
    const separator = options && options.separator ? options.separator : '-';
    const lower = options && options.lower ? true : false;
    const textSlug = text.toString().toLowerCase()
        .replace(/\s+/g, separator)
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, separator)
        .replace(/^-+/, '')
        .replace(/-+$/, '');

    return lower ? textSlug : textSlug.charAt(0).toUpperCase() + textSlug.slice(1);
}



exports.convertToCamelCase = (req, res, next) => {
    // Read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (readErr, data) => {
        if (readErr) {
            console.error('Error reading JSON file:', readErr);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        try {
            const activities = JSON.parse(data);

            // Convert specified fields to camel case
            const updatedActivities = activities.map((activity) => {
                return {
                    ...activity,
                    shortDescription: activity.shortDescription,
                    keyInstructions: activity.keyInstructions,
                    reservationPolicy: activity.reservationPolicy,
                    groupSize: activity.groupSize,
                    // Add other fields as needed
                };
            });

            // Remove the old fields
            const sanitizedActivities = updatedActivities.map(({ shortDescription, keyInstructions, reservationPolicy, groupSize, ...rest }) => rest);

            // Convert the updated activities back to JSON
            const modifiedJson = JSON.stringify(sanitizedActivities, null, 2);

            // Write the modified JSON back to the file
            fs.writeFile(jsonFilePath, modifiedJson, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing modified JSON to file:', writeErr);
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
                }

                res.status(200).json({
                    success: true,
                    message: 'Successfully updated JSON file with camel case fields',
                    data: sanitizedActivities
                });
            });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });
};


exports.sendActivitiesToApi = (req, res, next) => {
    // Read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (readErr, data) => {
        if (readErr) {
            console.error('Error reading JSON file:', readErr);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        try {
            const activities = JSON.parse(data);

            // Send a POST request to the API with all activities in a single array
            axios.post('http://localhost:8000/api/v1/activity', { activities })
                .then((response) => {
                    res.status(200).json({
                        success: true,
                        message: 'Data successfully sent to the API',
                        data: response.data
                    });
                })
                .catch((error) => {
                    console.error('Error sending data to the API:', error.message);
                    res.status(500).json({ success: false, message: 'Internal Server Error' });
                });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });
};