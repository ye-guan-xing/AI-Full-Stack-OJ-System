import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { UserSubmissionRecord } from '../../entities/user-submission-record.entity';
import { TestPoint } from '../../entities/test-point.entity';

interface JudgeJobData {
  submissionId: string;
  code: string;
  langId: number;
  testPoints: TestPoint[];
  recordIds: string[];
  limitedTime?: number;
}

interface Judge0SubmitResponse {
  token: string;
}

interface Judge0StatusResponse {
  stdout: string | null;
  time: string | null;
  memory: number | null;
  stderr: string | null;
  token: string;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
}

@Processor('judge')
export class JudgeProcessor {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(UserSubmissionRecord) private readonly recordRepo: Repository<UserSubmissionRecord>,
    private readonly httpService: HttpService,
    cs: ConfigService,
  ) {
    this.baseUrl = cs.get<string>('JUDGE0_BASE_URL') ?? 'http://localhost:2358';
  }

  @Process('judge')
  async handleJudge(job: Job<JudgeJobData>) {
    const { code, langId, testPoints, recordIds, limitedTime } = job.data;

    await Promise.all(
      testPoints.map(async (tp, i) => {
        const result = await this.judgeOne(code, langId, tp.input ?? '', limitedTime);
        const expected = (tp.output ?? '').trim();
        const actual = (result.stdout ?? '').trim();

        let verdict = 'RE';
        if (result.status.id === 3 && actual === expected) {
          verdict = 'AC';
        } else if (result.status.id === 3 && actual !== expected) {
          verdict = 'WA';
        } else if (result.status.id === 5) {
          verdict = 'TLE';
        }

        await this.recordRepo.update(recordIds[i], {
          result: verdict,
          time: result.time ?? '',
          memory: result.memory != null ? String(result.memory) : '',
        });
      }),
    );
  }

  private async judgeOne(
    code: string,
    langId: number,
    stdin: string,
    limitedTime?: number,
  ): Promise<Judge0StatusResponse> {
    const submitBody: Record<string, unknown> = {
      source_code: code,
      language_id: langId,
      stdin,
    };
    if (limitedTime) {
      submitBody.cpu_time_limit = limitedTime / 1000;
    }

    const submitRes = await firstValueFrom(
      this.httpService.post<Judge0SubmitResponse>(
        `${this.baseUrl}/submissions?base64_encoded=false&wait=false`,
        submitBody,
      ),
    );
    const token = submitRes.data.token;

    return this.pollResult(token);
  }

  private async pollResult(token: string, retries = 10): Promise<Judge0StatusResponse> {
    for (let i = 0; i < retries; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const res = await firstValueFrom(
        this.httpService.get<Judge0StatusResponse>(
          `${this.baseUrl}/submissions/${token}?base64_encoded=false`,
        ),
      );
      // status.id: 1=In Queue, 2=Processing, 3=Accepted(done), others=done
      if (res.data.status.id > 2) return res.data;
    }
    return { stdout: null, time: null, memory: null, stderr: 'Timeout polling', token, compile_output: null, message: null, status: { id: 5, description: 'Time Limit Exceeded' } };
  }
}
