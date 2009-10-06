#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/time.h>
#include <time.h>

struct cpu_stats {
   unsigned long user;
   unsigned long system;
   unsigned long nice;
   unsigned long idle;
   unsigned long io_wait;
   unsigned long hw_irq;
   unsigned long sw_irq;
};

int get_cpu_stats(struct cpu_stats *st)
{
	FILE *file = fopen("/proc/stat", "r");
	if (!file)
	{  
		fprintf(stderr, "Error: canot open /proc/stat\n");
		return -1;
	}

	fscanf(file, "cpu  %lu %lu %lu %lu %lu %lu %lu %*lu\n",
		&st->user,
		&st->nice,
		&st->system,
		&st->idle,
		&st->io_wait,
		&st->hw_irq,
		&st->sw_irq);

   fclose(file);
}

struct cpu_usage {
	double user;
	double system;
	double nice;
	double idle;
	double io_wait;
	double hw_irq;
	double sw_irq;
};

void get_cpu_usage(struct cpu_usage *us, struct cpu_stats *st, double time)
{
   us->user 	= (st[1].user - st[0].user) / (time * 100.0);
   us->system 	= (st[1].system - st[0].system) / (time * 100.0);
   us->nice 	= (st[1].nice - st[0].nice) / (time * 100.0);
   us->idle 	= (st[1].idle - st[0].idle) / (time * 100.0);
   us->io_wait = (st[1].io_wait - st[0].io_wait) / (time * 100.0);
   us->hw_irq 	= (st[1].hw_irq - st[0].hw_irq) / (time * 100.0);
   us->sw_irq 	= (st[1].sw_irq - st[0].sw_irq) / (time * 100.0);
}

void get_pids(const char *pname, int pids[], int *npids)
{
	char buf[256];
	sprintf(buf, "pidof %s", pname);
	FILE *f = popen(buf, "r");
	int r;

	*npids = 0;
	while (1)
	{
		r = fscanf(f, "%d", &(pids[*npids]));
		if (r == EOF)
			break;
		(*npids)++;
	}
   
	pclose(f); 
}

struct proc_stats {
	int pid;
	unsigned long user_time;
	unsigned long sys_time;
	unsigned long vsize;
	unsigned long rss;
};

int get_proc_stats(int pid, struct proc_stats *st) {
	char buf[64];
	FILE *f;

	st->pid = pid;
	st->user_time = st->sys_time = st->vsize = st->rss = 0;
	sprintf(buf, "/proc/%d/stat", pid);
	f = fopen(buf, "r");
	if (!f)
		return -1;
	
	fscanf(f, "%*d %*s %*c %*d %*d %*d %*d %*d %*lu %*lu \
%*lu %*lu %*lu %lu %lu %*ld %*ld %*ld %*ld %*ld %*ld %*lu %lu %ld",
                        &st->user_time,
                        &st->sys_time,
                        &st->vsize,
                        &st->rss);	
	fclose(f);
	return 0;
}

void get_proc_group_stats(
	int pid[],
	int npid,
	struct proc_stats st[],
	int *nst)
{
	int i;

	*nst = 0;
	for (i = 0; i < npid; i++)
	{
		if (get_proc_stats(pid[i], &st[*nst]) == 0)
			(*nst)++;
	}
}

struct proc_usage {
	float sys;
	float user;
	unsigned long vsize;
	unsigned long rss;
};

void get_proc_usage(
	struct proc_stats st1[],
	int nst1,
	struct proc_stats st2[],
	int nst2,
	struct proc_usage *us,
	double time) 
{
	int i, j, found;
	unsigned long sys;
	unsigned long usr;

	us->vsize = us->rss = sys = usr = 0l;
	for (j = 0; j < nst2; j++)
	{
		found = 0;
		for (i = 0; i < nst1; i++)
		{
			if (st1[i].pid == st2[j].pid)
			{
				sys += (st2[j].sys_time - st1[i].sys_time);
				usr += (st2[j].user_time - st1[i].user_time);
				found = 1;
				break;
			}
		}
		if (!found)
		{
			sys += st2[j].sys_time;
			usr += st2[j].user_time;
			
		}
		us->vsize += st2[j].vsize;
		us->rss += st2[j].rss;
	}
	us->sys = (float) sys / (time * 100.0);
	us->user = (float) usr / (time * 100.0);
}

struct disk_stats {
	unsigned long rd_sec;
	unsigned long rd_time;
	unsigned long wr_sec;
	unsigned long wr_time;
};

void get_disk_stats(struct disk_stats *st)
{
	char dev[64];
	FILE *f = fopen("/proc/diskstats", "r");
	while (1)
	{
		int r = fscanf(f, "%*d %*d %s \
%*lu %*lu %lu %lu %*lu %*lu %lu %lu %*lu %*lu %*lu", 
			dev, &st->rd_sec, &st->rd_time, &st->wr_sec, &st->wr_time);
		if (r == EOF || strcmp(dev, "sda1") == 0)
			break;
	}
	fclose(f);
}

struct disk_usage {
	float rd_flow;
	float wr_flow;
	float rd_sflow;
	float wr_sflow;
};

void get_disk_usage(struct disk_usage *us, struct disk_stats *st, double time)
{
	if (st[0].rd_time == st[1].rd_time)
		us->rd_flow = us->rd_sflow = 0.0;
	else {
		us->rd_sflow = ((st[1].rd_sec - st[0].rd_sec) / 2) /
		              ((float) (st[1].rd_time - st[0].rd_time) / 1000.0);
        	us->rd_flow = ((st[1].rd_sec - st[0].rd_sec) / 2) / time;
	}
	if (st[0].wr_time == st[1].wr_time)
		us->wr_flow = us->wr_sflow = 0.0;
	else {
		us->wr_sflow = ((st[1].wr_sec - st[0].wr_sec) / 2) /
        	              ((float) (st[1].wr_time - st[0].wr_time) / 1000.0);
 		us->wr_flow = ((st[1].wr_sec - st[0].wr_sec) / 2) / time;
	}
}

int main(int argc, char *argv[])
{
	double round, g_round;
	double g_sampling = 5.0, sampling = 1.0;
	struct cpu_stats cpu_stats[2];
	struct cpu_usage cpu_used, g_cpu_used;
	struct proc_stats apa_stats1[640], apa_stats2[640];
	struct proc_stats pg_stats1[640], pg_stats2[640];
	int napa_stats1, napa_stats2, npg_stats1, npg_stats2;
  	struct proc_usage apa_usage, pg_usage, g_apa_usage, g_pg_usage;
	struct disk_stats disk_stats[2];
	struct disk_usage disk_usage, g_disk_usage;
	int apa_pids[640];
	int apa_npids;  
	int pg_pids[640];
	int pg_npids;
	int i;
	struct timeval t0, t1, t00, t11;
	double tinc;
	double apa_procs, pg_procs;

	const char *ws_pname = "apache2";
	// const char *ws_pname = "lighttpd python";
	const char *pg_pname = "postmaster pgpool"; 

	printf("Rnd\tCPUus\tCPUsy\tCPUni\tCPUid\tCPUwa\tCPUhi\tCPUsi\t\
APAcpu\tAPAus\tAPAsy\tAPAvirmem\tAPArss\tPGcpu\tPGus\tPGsy\tPGvirmem\tPGrss\t\
DSKflow\tDSKsflow\tApaProc\tPgProc\n");

	g_round = round = 0.0;
	gettimeofday(&t00, NULL);
	while (1)
	{
		round = 0.0;
		g_cpu_used.user = g_cpu_used.system = g_cpu_used.nice = g_cpu_used.idle =
			g_cpu_used.io_wait = g_cpu_used.hw_irq = g_cpu_used.sw_irq = 0.0;
		g_apa_usage.user = g_apa_usage.sys = g_pg_usage.user = g_pg_usage.sys = 0.0;
		g_apa_usage.vsize = g_apa_usage.rss = g_pg_usage.vsize = g_pg_usage.rss = 0l;
		g_disk_usage.rd_flow = g_disk_usage.rd_sflow = g_disk_usage.wr_flow = g_disk_usage.wr_sflow = 0.0;	
		apa_procs = pg_procs = 0.0;

		i = 0;
		while (round < g_sampling)
		{ 
			get_pids(ws_pname, apa_pids, &apa_npids);
			get_pids(pg_pname, pg_pids, &pg_npids);

			get_cpu_stats(&cpu_stats[0]);
			get_proc_group_stats(apa_pids, apa_npids, apa_stats1, &napa_stats1);
			get_proc_group_stats(pg_pids, pg_npids, pg_stats1, &npg_stats1);
			get_disk_stats(&disk_stats[0]);
			gettimeofday(&t0, NULL);

			sleep((int) sampling);

			get_pids(ws_pname, apa_pids, &apa_npids);
			get_pids(pg_pname, pg_pids, &pg_npids);

			get_cpu_stats(&cpu_stats[1]);
			get_proc_group_stats(apa_pids, apa_npids, apa_stats2, &napa_stats2);
			get_proc_group_stats(pg_pids, pg_npids, pg_stats2, &npg_stats2);
			get_disk_stats(&disk_stats[1]);
			gettimeofday(&t1, NULL);

			tinc = (double)(t1.tv_sec - t0.tv_sec) + 
		       ((t1.tv_usec - t0.tv_usec) / 1000000.0);

			round += tinc;
			get_cpu_usage(&cpu_used, cpu_stats, tinc);
			get_proc_usage(apa_stats1, napa_stats1, apa_stats2, napa_stats2, &apa_usage, tinc);
			get_proc_usage(pg_stats1, npg_stats1, pg_stats2, npg_stats2, &pg_usage, tinc);
			get_disk_usage(&disk_usage, disk_stats, tinc);

			g_cpu_used.user += cpu_used.user;
			g_cpu_used.system += cpu_used.system;
			g_cpu_used.nice += cpu_used.nice;
			g_cpu_used.idle += cpu_used.idle;
			g_cpu_used.io_wait += cpu_used.io_wait;
			g_cpu_used.hw_irq += cpu_used.hw_irq;
			g_cpu_used.sw_irq += cpu_used.sw_irq;
			g_apa_usage.user += apa_usage.user;
			g_apa_usage.sys += apa_usage.sys;
			g_apa_usage.vsize += apa_usage.vsize;
			g_apa_usage.rss += apa_usage.rss;
			g_pg_usage.user += pg_usage.user;
			g_pg_usage.sys += pg_usage.sys;
			g_pg_usage.vsize += pg_usage.vsize;
			g_pg_usage.rss += pg_usage.rss;
			g_disk_usage.rd_flow += disk_usage.rd_flow;
			g_disk_usage.rd_sflow += disk_usage.rd_sflow;
			g_disk_usage.wr_flow += disk_usage.wr_flow;
			g_disk_usage.wr_sflow += disk_usage.wr_sflow;

			apa_procs += apa_npids;
			pg_procs += pg_npids;
			
			i++;
		}
		gettimeofday(&t11, NULL);
		g_round = (double) (t11.tv_sec - t00.tv_sec) + 
			((t11.tv_usec - t00.tv_usec) / 1000000.0);
		double samples = i / sampling;
		g_cpu_used.user = g_cpu_used.user / samples;
		g_cpu_used.system = g_cpu_used.system / samples;
		g_cpu_used.nice = g_cpu_used.nice / samples;
		g_cpu_used.idle = g_cpu_used.idle / samples;
		g_cpu_used.io_wait = g_cpu_used.io_wait / samples;
		g_cpu_used.hw_irq = g_cpu_used.hw_irq / samples;
		g_cpu_used.sw_irq = g_cpu_used.sw_irq / samples;
		g_apa_usage.user = g_apa_usage.user / samples;
		g_apa_usage.sys = g_apa_usage.sys / samples;
		g_apa_usage.vsize = g_apa_usage.vsize / samples;
		g_apa_usage.rss = g_apa_usage.rss / samples;
		g_pg_usage.user = g_pg_usage.user / samples;
		g_pg_usage.sys = g_pg_usage.sys / samples;
		g_pg_usage.vsize = g_pg_usage.vsize / samples;
		g_pg_usage.rss = g_pg_usage.rss / samples;
		g_disk_usage.rd_flow = g_disk_usage.rd_flow / samples;
		g_disk_usage.rd_sflow = g_disk_usage.rd_sflow / samples;
		g_disk_usage.wr_flow = g_disk_usage.wr_flow / samples;
		g_disk_usage.wr_sflow = g_disk_usage.wr_sflow / samples;
		apa_procs = apa_procs / samples;
		pg_procs = pg_procs / samples;

		printf("%.2lf\t%.2lf\t%.2lf\t%.2lf\t%.2lf\t%.2lf\t%.2lf\t%.2lf\t\
%.2f\t%.2f\t%.2f\t%lu\t%lu\t%.2f\t%.2f\t%.2f\t%lu\t%lu\t\
%.2f\t%.2f\t%.2f\t%.2f\n",
			g_round,
			g_cpu_used.user,
			g_cpu_used.system,
			g_cpu_used.nice,
			g_cpu_used.idle,
			g_cpu_used.io_wait,
			g_cpu_used.hw_irq,
			g_cpu_used.sw_irq,
			g_apa_usage.user + g_apa_usage.sys,
			g_apa_usage.user,
			g_apa_usage.sys,
			g_apa_usage.vsize,
			g_apa_usage.rss * 4,
			g_pg_usage.user + g_pg_usage.sys,
			g_pg_usage.user,
			g_pg_usage.sys,
			g_pg_usage.vsize,
			g_pg_usage.rss * 4,
			g_disk_usage.rd_flow + g_disk_usage.wr_flow,
			g_disk_usage.rd_sflow + g_disk_usage.wr_sflow,
			apa_procs,
			pg_procs);
	} 
}
