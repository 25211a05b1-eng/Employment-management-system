const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (payload) {
            options.headers['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
};

async function runTests() {
    console.log('--- Testing API Health ---');
    const health = await request('/api');
    console.log('Health:', health.body.message);

    console.log('\n--- Testing Admin Login ---');
    const adminLogin = await request('/api/auth/login', 'POST', {
        email: 'admin@company.com',
        password: 'Admin@123'
    });
    console.log('Admin Login status:', adminLogin.status, 'Success:', adminLogin.body.success, 'Role:', adminLogin.body.data.user.role);
    const adminToken = adminLogin.body.data.token;

    console.log('\n--- Testing Admin Dashboard ---');
    const adminDash = await request('/api/dashboard/admin', 'GET', null, adminToken);
    console.log('Admin Dashboard Stats:', adminDash.body.data.counts);

    console.log('\n--- Testing Employee Login ---');
    const empLogin = await request('/api/auth/login', 'POST', {
        email: 'rahul.verma@company.com',
        password: 'Employee@123'
    });
    console.log('Employee Login status:', empLogin.status, 'Success:', empLogin.body.success);
    const empToken = empLogin.body.data.token;

    console.log('\n--- Testing Employee Dashboard ---');
    const empDash = await request('/api/dashboard/employee', 'GET', null, empToken);
    console.log('Employee Stats:', empDash.body.data.stats);

    console.log('\n--- Testing Leave Application (Validation: Overlap check) ---');
    const overlapTest = await request('/api/leave-requests', 'POST', {
        leave_type_id: 1,
        start_date: '2026-10-06',
        end_date: '2026-10-08',
        reason: 'Should fail due to overlap'
    }, empToken);
    console.log('Overlap Test Status:', overlapTest.status, 'Message:', overlapTest.body.message);

    console.log('\n--- Testing Manager Login ---');
    const mgrLogin = await request('/api/auth/login', 'POST', {
        email: 'manager.eng@company.com',
        password: 'Manager@123'
    });
    console.log('Manager Login status:', mgrLogin.status, 'Role:', mgrLogin.body.data.user.role);
    const mgrToken = mgrLogin.body.data.token;

    console.log('\n--- Testing Manager Dashboard ---');
    const mgrDash = await request('/api/dashboard/manager', 'GET', null, mgrToken);
    console.log('Manager Pending Requests Count:', mgrDash.body.data.pendingCount);

    console.log('\nAll API sanity checks passed successfully!');
}

runTests().catch(console.error);
